FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER root
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["WEA_Project.sln", "."]
COPY ["WEA_BE/WEA_BE.csproj", "WEA_BE/"]
COPY ["EFModels/EFModels.csproj", "EFModels/"]
RUN dotnet restore

COPY ["WEA_BE/", "WEA_BE/"]
COPY ["EFModels/", "EFModels/"]
WORKDIR "/src/WEA_BE"
RUN dotnet build -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

COPY ["WEA_BE/Data", "/app/Data"]

ENTRYPOINT ["dotnet", "WEA_BE.dll"]
