# Nota Sulla Componente Tecnica Dell'Atlante AtLiTeG

**Versione**: 1.0  
**Data**: 9 aprile 2026  
**Destinazione d'uso**: appunti sintetici per presentazione seminariale

## Obiettivo

Questa nota riassume, in forma non specialistica ma accurata, il funzionamento tecnico dell'atlante AtLiTeG, così da poterlo descrivere durante una presentazione pubblica mettendone in evidenza gli aspetti piu innovativi.

## Che cos'e, dal punto di vista tecnico

L'atlante AtLiTeG e una piattaforma web interattiva che trasforma un patrimonio linguistico e storico complesso in un ambiente di consultazione visiva, navigabile e interrogabile in tempo reale.

Sul piano tecnico, il sistema mette in relazione quattro livelli:

- i dati lessicografici e cronologici dei lemmi
- i dati geografici delle localita e delle aree geolinguistiche
- gli strumenti di esplorazione da parte dell'utente, come filtri, ricerca, timeline e indice alfabetico
- un'infrastruttura di pubblicazione che rende il sistema accessibile via web e aggiornabile nel tempo

In altre parole, l'atlante non si limita a mostrare una mappa: coordina dati linguistici, temporali e spaziali in un'unica interfaccia di lavoro.

## Come funziona in pratica

Il funzionamento puo essere descritto in cinque passaggi.

### 1. I dati vengono preparati e normalizzati

Il punto di partenza e un insieme di dati tabellari e geografici: CSV per lemmi, forme, frequenze, datazioni e localita; JSON e GeoJSON per gli ambiti geografici e i confini territoriali.

Prima dell'uso pubblico, questi materiali vengono controllati, preprocessati e convertiti in formati ottimizzati per il web. Questo consente all'applicazione di caricare rapidamente anche dataset ampi, senza costringere il browser a elaborare ogni volta file grezzi.

### 2. Il frontend costruisce una lettura unificata del corpus

L'interfaccia e sviluppata come applicazione web moderna in Next.js, React e TypeScript. Quando l'utente apre il sito, il sistema carica i dati e li organizza in una struttura comune che alimenta tutti i componenti della pagina.

Questo significa che mappa, pannello di dettaglio, timeline, metriche e indice alfabetico non lavorano separatamente: leggono lo stesso stato applicativo e reagiscono insieme a ogni selezione.

### 3. Filtri e ricerca aggiornano tutta la piattaforma in tempo reale

Una delle caratteristiche piu importanti e la sincronizzazione dei filtri. Se l'utente seleziona un periodo, una categoria, una lettera o una forma lessicale, l'intero ambiente si aggiorna in modo coerente:

- cambia la distribuzione sulla mappa
- si aggiornano i conteggi aggregati
- si restringe il dettaglio dei lemmi
- si modifica la lettura cronologica nella timeline

Dal punto di vista metodologico, questo rende l'atlante uno strumento di interrogazione dinamica del corpus, non una semplice vetrina grafica.

### 4. La mappa non e solo illustrativa, ma interpretativa

La mappa interattiva e costruita con Leaflet e utilizza un sistema di clustering che aggrega automaticamente i punti quando la densita dei dati aumenta. I marker non mostrano solo una posizione: visualizzano anche il peso quantitativo delle attestazioni tramite cerchi con intensita e numeri leggibili.

Aprendo un punto sulla mappa, l'utente accede a un popup strutturato che raggruppa i lemmi per localita e permette di vedere forme, datazioni e frequenze. In questo modo la mappa non serve soltanto a orientarsi nello spazio, ma diventa una porta di accesso ai dati filologici e lessicografici associati a ciascun luogo.

### 5. Il sistema e pensato anche per la manutenzione e l'aggiornamento

La versione attuale non e un prototipo statico chiuso. Include anche un backend leggero, con accesso controllato ai dati, che consente di servire i dataset in modo protetto e di gestire l'aggiornamento dei contenuti tramite caricamento CSV.

Questo aspetto e importante perche rende l'atlante non solo uno strumento di consultazione, ma una piattaforma che puo essere mantenuta, corretta e arricchita senza dover ricostruire manualmente ogni volta l'intera applicazione.

## Elementi Innovativi Del Lavoro Svolto

Se occorre evidenziare in pochi punti gli aspetti piu originali della componente tecnica, si possono sottolineare questi.

### Integrazione di tre dimensioni in un'unica esperienza

Il sistema mette in relazione in modo simultaneo la dimensione lessicale, quella geografica e quella cronologica. L'utente non consulta tre strumenti separati, ma un unico ambiente nel quale ogni azione produce effetti coordinati su tutte le visualizzazioni.

### Passaggio da rappresentazione statica a interrogazione dinamica

L'atlante e progettato per far emergere pattern e distribuzioni, non soltanto per mostrare dati gia ordinati. L'utente puo formulare domande implicite al corpus attraverso filtri combinati, ricerca testuale, indice alfabetico e timeline.

### Mappa semantica e quantitativa, non solo cartografica

La cartografia e stata trattata come interfaccia di lettura dei dati. Il clustering, i popup strutturati e la gestione delle frequenze consentono una visualizzazione che conserva densita informativa senza sacrificare la leggibilita.

### Ottimizzazione per dataset reali e uso pubblico

La piattaforma non e costruita come dimostrazione teorica, ma come applicazione adatta a dati reali e consultazione online. Per questo sono stati introdotti preprocessamento, caricamento ottimizzato, indicizzazione della ricerca e gestione efficiente dello stato dell'applicazione.

### Architettura sostenibile nel tempo

L'infrastruttura separa interfaccia, dati e servizi di aggiornamento. Questo permette evoluzioni successive, nuove importazioni di dati, correzioni del corpus e mantenimento tecnico piu semplice.

### Attenzione a accesso, sicurezza e deploy

L'applicazione e containerizzata con Docker e pubblicata tramite frontend web dedicato. L'accesso ai dataset puo avvenire attraverso API protette; l'area amministrativa per l'aggiornamento dei dati e separata; sono presenti controlli come autenticazione, limitazione delle richieste e procedure di deploy automatizzato.

## Formula Breve Per La Presentazione Orale

Se serve una formulazione molto sintetica, si puo dire:

> AtLiTeG e un atlante digitale interattivo che integra in un'unica piattaforma dati lessicali, geografici e cronologici. Tecnicamente, non si limita a visualizzare una mappa, ma costruisce un ambiente di interrogazione del corpus: i filtri, la ricerca, la timeline e la cartografia lavorano insieme e si aggiornano in tempo reale. La parte innovativa del lavoro sta proprio in questa integrazione dinamica, resa sostenibile da una struttura tecnica che consente sia la consultazione pubblica sia l'aggiornamento controllato dei dati.

## Formula Estesa Per Un Intervento Di 1-2 Minuti

Se si desidera una versione leggermente piu ampia:

> Dal punto di vista tecnico, l'atlante AtLiTeG e stato progettato come una piattaforma web che mette in relazione il corpus lessicografico con i dati geografici e temporali. I dati vengono preprocessati e organizzati in modo da essere consultabili rapidamente online; poi l'interfaccia sincronizza mappa, timeline, ricerca e filtri in un unico ambiente interattivo. Questo consente non solo di vedere dove compare una forma, ma di esplorarne distribuzione, frequenza, cronologia e contesto di attestazione. Uno degli aspetti piu innovativi e che la mappa non ha solo funzione illustrativa: diventa un dispositivo di lettura e analisi del corpus. Inoltre la piattaforma e stata costruita per essere mantenibile e aggiornabile nel tempo, grazie a un'architettura che separa i dati, la logica applicativa e i servizi di pubblicazione.

## Nota Finale

Se lo si desidera, questa componente tecnica puo essere presentata non come elemento accessorio, ma come parte integrante del valore scientifico del progetto: rende infatti possibile una nuova forma di accesso, confronto e interpretazione dei dati linguistici, che affianca e potenzia il lavoro filologico e lessicografico tradizionale.