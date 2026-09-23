@echo off
chcp 65001 >nul
title AI Project Guide
cd /d "%~dp0"

cls
echo.
echo    AI Project Guide
echo    ==================================================
echo.
echo      [1]  La guia                    src\index.html
echo      [2]  La presentacion            docs\presentacion.html
echo.
echo      [3]  Las dos: guia + presentacion
echo.
echo      [0]  Salir
echo.

choice /c 1230 /n /m "   Pulsa un numero: "
if errorlevel 4 exit /b 0
if errorlevel 3 goto ambas
if errorlevel 2 goto presentacion
if errorlevel 1 goto guia
exit /b 0

:guia
call :abrir "src\index.html"
goto :eof

:presentacion
call :abrir "docs\presentacion.html"
goto :eof

:ambas
call :abrir "src\index.html"
call :abrir "docs\presentacion.html"
goto :eof

:abrir
if not exist "%~1" (
  echo.
  echo    No encuentro el archivo: %~1
  echo    Copia la carpeta completa, no solo este acceso directo.
  echo.
  pause
  exit /b 1
)
start "" "%~1"
exit /b 0
