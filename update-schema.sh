#!/usr/bin/env bash

# Script per aggiornare lo schema GraphQL dal backend
# Usa: ./update-schema.sh

set -e

echo "📦 Aggiornamento dello schema GraphQL..."

# Verifica se il backend è in esecuzione
if ! curl -s http://localhost:5095/graphql > /dev/null 2>&1; then
    echo "⚠️  Il backend non è raggiungibile su http://localhost:5095/graphql"
    echo "Assicurati che il backend sia in esecuzione prima di eseguire questo script."
    echo ""
    echo "Puoi avviarlo con:"
    echo "  cd PhantomDave.BankTracking.Api && dotnet run"
    echo "  oppure"
    echo "  docker-compose up backend"
    exit 1
fi

# Vai nella cartella frontend
cd "$(dirname "$0")/frontend"

echo "⬇️  Download dello schema dal backend..."
npm run schema:download

echo "✅ Schema aggiornato con successo!"
echo ""
echo "Il file schema.graphql è stato aggiornato e i tipi TypeScript sono stati generati."

