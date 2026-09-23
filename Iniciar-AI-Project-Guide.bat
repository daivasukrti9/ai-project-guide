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
echo      [2]  La guia con el logo        src\index-stt.html
echo      [3]  La presentacion            docs\presentacion.html
echo.
echo      [4]  Las dos: guia con logo + presentacion
echo.
echo      [0]  Salir
echo.

choice /c 12340 /n /m "   Pulsa un numero: "
if errorlevel 5 exit /b 0
if errorlevel 4 goto ambas
if errorlevel 3 goto presentacion
if errorlevel 2 goto marca
if errorlevel 1 goto guia
exit /b 0

:guia
call :abrir "src\index.html"
goto :eof

:marca
call :abrir "src\index-stt.html"
goto :eof

:presentacion
call :abrir "docs\presentacion.html"
goto :eof

:ambas
call :abrir "src\index-stt.html"
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
