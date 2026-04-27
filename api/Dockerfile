FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["api/SPI.csproj", "api/"]
COPY ["EFModels/EFModels.csproj", "EFModels/"]
RUN dotnet restore "api/SPI.csproj"

COPY . .
WORKDIR "/src/api"
RUN dotnet publish "SPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SPI.dll"]