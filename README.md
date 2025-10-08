# Parada Inteligente - Protótipo IoT

## Descrição
Este projeto implementa uma **parada de ônibus inteligente** utilizando um ESP32, com foco em acessibilidade para pessoas com **deficiência visual** e **deficiência física**.  
O protótipo combina **lógica local** (decisões instantâneas no dispositivo) e **lógica via nuvem** (ajustes remotos de thresholds e coleta de dados) utilizando o **ThingSpeak**.  

Um **dashboard web** exibe os dados em tempo real, incluindo cliques nos botões e thresholds, permitindo monitoramento e análise.

---

## Funcionalidades

### Protótipo ESP32
- Botão Azul: acionado por pessoas com deficiência visual → LED azul acende + log.
- Botão Amarelo: acionado por pessoas com deficiência física → LED amarelo acende + log.
- Busca thresholds via ThingSpeak (GET) e aplica regras remotas.
- Fail-safe: caso a nuvem não responda, utiliza valores padrão locais.
- Decisões locais para ações críticas: LEDs acendem imediatamente sem depender da internet.
- Logs enviados para nuvem: possibilita análise histórica e ajuste remoto de thresholds.

### Dashboard Web
- Gráfico de linhas para **tempo, ativação de LED e som**.
- Gráfico de barras para **total de cliques por tipo de botão**.
- Atualização automática a cada 5 segundos via API ThingSpeak.
- Interface responsiva, visual clara e amigável, construída com **HTML, CSS e Chart.js**.
- Permite visualizar a distribuição de cliques por horário, separando tipo de usuário.
- Facilita análise de padrões e tomada de decisão baseada em dados históricos.

---

## Tecnologias Utilizadas
- **ESP32** (simulado no Wokwi)
- **ThingSpeak API** (para logs e thresholds)
- **ArduinoJson** (para parsear JSON no ESP32)
- **HTML, CSS e Chart.js** (para o dashboard web)
- **VS Code** (para edição e deploy do projeto)

---


