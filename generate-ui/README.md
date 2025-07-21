# 🎨 Generate UI - Sistema de Geração de Assets

Esta pasta contém todos os scripts e documentação para geração de assets visuais do RPG-AI.

## 📁 Arquivos

### Scripts Principais

- `generate-custom-asset.sh` - Gerador de assets customizados
- `generate-ui-assets.sh` - Gerador de assets predefinidos
- `process-assets.sh` - Processador e otimizador de assets
- `test-image.sh` - Script de teste da API

### Documentação

- `VISUAL-IDENTITY.md` - Guia completo de identidade visual
- `VISUAL-IDENTITY-QUICKSTART.md` - Guia rápido de uso

## 🚀 Uso Rápido

```bash
cd generate-ui

# Gerar asset customizado
./generate-custom-asset.sh "sword icon" icons espada

# Múltiplos tamanhos
./generate-custom-asset.sh -m 64x64,128x128 "potion" items pocao

# Ver ajuda
./generate-custom-asset.sh --help
```

## 🎯 Status

Sistema funcional com:

- ✅ Estilo cartoon game unificado
- ✅ Múltiplos tamanhos otimizados
- ✅ Economia de API calls
- ✅ Redimensionamento automático

**Projeto pausado temporariamente** - Scripts prontos para uso futuro.
