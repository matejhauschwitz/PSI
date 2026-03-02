echo "=========================================="
echo " Spouštím lokální prototyp BookStore      "
echo "=========================================="

if [ ! -d "node_modules" ]; then
    echo "Závislosti nejsou nainstalovány. Spouštím 'npm install'..."
    npm install
fi

echo "Startuji vývojový server..."
echo "Po spuštění si otevřete v prohlížeči adresu: http://localhost:5050"
echo "=========================================="

npm run dev
