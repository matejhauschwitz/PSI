FROM node:20-alpine AS frontend-build
WORKDIR /frontend-src

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY api/SPI.csproj api/
COPY EFModels/EFModels.csproj EFModels/
RUN dotnet restore api/SPI.csproj

COPY api/ api/
COPY EFModels/ EFModels/

WORKDIR /src/api
RUN dotnet publish SPI.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app/publish .

COPY --from=frontend-build /frontend-src/dist ./wwwroot

ENTRYPOINT ["dotnet", "SPI.dll"]