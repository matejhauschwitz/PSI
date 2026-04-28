FROM node:20-alpine AS frontend-build
WORKDIR /frontend-src

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npx vite build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY api/api/SPI.csproj api/api/
COPY api/EFModels/EFModels.csproj api/EFModels/

RUN dotnet restore api/api/SPI.csproj

COPY api/api/ api/api/
COPY api/EFModels/ api/EFModels/

WORKDIR /src/api/api
RUN dotnet publish SPI.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app/publish .
COPY --from=frontend-build /frontend-src/dist ./wwwroot

ENTRYPOINT ["dotnet", "SPI.dll"]