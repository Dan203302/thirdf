program LegacyCSV;

{$mode objfpc}{$H+}

uses
  SysUtils, DateUtils, Unix;

function GetEnvDef(const name, def: string): string;
var v: string;
begin
  v := GetEnvironmentVariable(name);
  if v = '' then Exit(def) else Exit(v);
end;

function RandFloat(minV, maxV: Double): Double;
begin
  Result := minV + Random * (maxV - minV);
end;

procedure GenerateAndCopy();
var
  outDir, fn, fullpath, pghost, pgport, pguser, pgpass, pgdb, copyCmd: string;
  f: TextFile;
  ts, okStr: string;
  voltage, temp: Double;
  ok: Boolean;
begin
  outDir := GetEnvDef('CSV_OUT_DIR', '/data/csv');
  ts := FormatDateTime('yyyymmdd_hhnnss', Now);
  fn := 'telemetry_' + ts + '.csv';
  fullpath := IncludeTrailingPathDelimiter(outDir) + fn;

  // write CSV
  AssignFile(f, fullpath);
  Rewrite(f);
  voltage := RandFloat(3.2, 12.6);
  temp := RandFloat(-50.0, 80.0);
  ok := (voltage >= 3.0) and (voltage <= 12.6) and (temp >= -40.0) and (temp <= 75.0);
  okStr := BoolToStr(ok, True);
  Writeln(f, 'recorded_at,is_ok,voltage,temp,source_file');
  Writeln(f, FormatDateTime('yyyy-mm-dd hh:nn:ss', Now) + ',' +
             okStr + ',' +
             FormatFloat('0.00', voltage) + ',' +
             FormatFloat('0.00', temp) + ',' +
             fn);
  CloseFile(f);

  // COPY into Postgres
  pghost := GetEnvDef('PGHOST', 'db');
  pgport := GetEnvDef('PGPORT', '5432');
  pguser := GetEnvDef('PGUSER', 'monouser');
  pgpass := GetEnvDef('PGPASSWORD', 'monopass');
  pgdb   := GetEnvDef('PGDATABASE', 'monolith');

  // Use psql with COPY FROM PROGRAM for simplicity
  // Here we call psql reading from file
  copyCmd := 'PGPASSWORD=' + pgpass + ' psql "host=' + pghost + ' port=' + pgport + ' user=' + pguser + ' dbname=' + pgdb + '" ' +
             '-c "\copy telemetry_legacy(recorded_at, is_ok, voltage, temp, source_file) FROM ''' + fullpath + ''' WITH (FORMAT csv, HEADER true)"';
  // Execute
  fpSystem(copyCmd);
end;

var
  period: Integer;
  runOnce: Boolean;
begin
  Randomize;
  period := StrToIntDef(GetEnvDef('GEN_PERIOD_SEC', '300'), 300);
  runOnce := SameText(GetEnvDef('LEGACY_RUN_ONCE', '0'), '1');

  if runOnce then
  begin
    try
      GenerateAndCopy();
    except
      on E: Exception do
        WriteLn('Legacy error: ', E.Message);
    end;
    Halt(0);
  end;

  while True do
  begin
    try
      GenerateAndCopy();
    except
      on E: Exception do
        WriteLn('Legacy error: ', E.Message);
    end;
    Sleep(period * 1000);
  end;
end.
