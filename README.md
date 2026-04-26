# 🏁 BUGGYBOY JS 🏁
## IL GIOCO DI CORSE CHE NON HAI CHIESTO MA CHE IL DESTINO HA DECISO DI DARTI COMUNQUE

---

> *"Ho giocato a BuggyBoy e ora non riesco a guardare una pozzanghera senza sentire l'ansia."*
> — Recensione a caso, probabilmente vera

---

## 🚨 COS'È QUESTA ROBA

Un buggy. Una strada. Ostacoli che vogliono la tua rovina. Tu contro il mondo, l'olio, i tronchi d'albero e i tuoi stessi riflessi.

Guidare è semplice. Sopravvivere è un'altra storia. Finire in classifica è praticamente un miracolo.

---

## 🕹️ COME SI GIOCA (spiegazione seria in un README demenziale, sì, lo so)

### Il tuo bolide

Un buggy giallo con ruote enormi, fari abbaglianti e zero air bag. Sei in vista dall'alto, come un'aquila che guarda la sua stessa tragedia.

### La strada

Si torce, si curva, cambia direzione senza preavviso come un collega di lavoro in una riunione. Uscire dalla carreggiata equivale a un crash immediato. I bordi grigi chiari sono la ghiaia — belli da vedere, devastanti da toccare.

### Gli ostacoli (aka i tuoi nemici personali)

| Ostacolo | Cosa fa | Gravità |
|----------|---------|---------|
| 🪨 **Sasso** | Ti ferma di botto | Brutto |
| 🪵 **Tronco** | Esiste in versione S, M e XL | Più brutto |
| 🛢️ **Bidone** | Solido come le tue speranze infrante | Bruttissimo |
| 💧 **Pozzanghera** | Ti fa sbandare e perdere il controllo | Umido e brutto |
| 🫙 **Chiazza d'olio** | Idem ma con più stile | Scivoloso e brutto |

Sassi, tronchi e bidoni sono **solidi** — ci vai dentro e vai in crash. Pozzanghere e olio ti fanno **sbandare** — il buggy va per i fatti suoi per un secondo e mezzo mentre tu piangi.

### I bumper (rampe di salto)

A volte trovi una rampa gialla in mezzo alla strada. **PRENDILA.** Il buggy vola, gli ostacoli passano sotto, tu ti senti invincibile per 0.8 secondi. La fisica si prende una pausa. Vale.

### Le bandierine checkpoint

Archi colorati che attraversano tutta la carreggiata. Passarci dentro vale **+500 punti** e resetta il timer. Ignorarle al livello 2+ significa morire di tempo, non di ostacoli.

### Le bandierine bonus (le stelline colorate)

Fluttuano sul bordo della strada come sogni ad occhi aperti. Raccoglila cinque volte dello stesso colore e ottieni un **SUPER BONUS**. I punteggi per tipo:

| Colore | Punti singola | Bonus x5 |
|--------|--------------|----------|
| 🔴 Rosso | 100 | 1.000 |
| ⚪ Bianco | 200 | 2.000 |
| 🟣 Viola | 300 | 3.000 |
| 🔵 Blu | 400 | 4.000 |
| 🟢 Verde | 500 | 5.000 |

Le stelline le vedi in alto a destra. Tienici d'occhio.

---

## ⌨️ CONTROLLI

| Tasto | Azione |
|-------|--------|
| ↑ / W | Accelera (e prega) |
| ↓ / S | Frena (inutile, ma fa sentire meno in colpa) |
| ← → / A D | Sterza come se la tua vita dipendesse da questo — perché dipende |
| **1** | Difficoltà FACILE — strada infinita, nessun timer, esistenza serena |
| **2** | Difficoltà NORMALE — 60 secondi per checkpoint o muori |
| **3** | Difficoltà DIFFICILE — 45 secondi, gli ostacoli ridono di te |
| **4** | Difficoltà ESPERTO — 30 secondi, buona fortuna, non ci crediamo |
| **R** | Azzera la classifica (da usare solo dopo profonda riflessione esistenziale) |
| **INVIO** | Conferma il nome a fine partita / torna alla classifica |

---

## 💀 IL SISTEMA DELLE VITE

Hai **3 vite** (cuoricini in alto a destra, ♥♥♥).

Le perdi quando:
- Esci di strada
- Colpisci qualcosa di solido
- Il timer del checkpoint arriva a zero (livello 2+)

Quando le perdi tutte: **GAME OVER**. La musica si ferma. Appare il tuo punteggio. Soffri in silenzio.

---

## 🏆 LA CLASSIFICA

Salva i **top 10** per ogni livello di difficoltà in `localStorage`. Il nome è di 3 caratteri. Sceglilo bene — rimarrà lì finché qualcuno non preme R.

---

## 🔧 TECNOLOGIE USATE (per i nerd presenti)

- **PixiJS 8** — rendering WebGL, perché il Canvas 2D non è abbastanza drammatico
- **SVG** — tutta la grafica è vettoriale e si vede benissimo su qualsiasi schermo
- **ZzFX** — effetti sonori sintetici generati al volo (crash, salto, bonus, ecc.)
- **Web Audio API** — suono del motore in tempo reale modulato sulla velocità
- **MP3** — musica di sottofondo e effetti acqua/olio via file audio reali
- **localStorage** — classifica persistente tra una sessione e l'altra

---

## 🎵 CREDITS

Musica di sottofondo: **"Dune Buggy"** degli **Oliver Onions**
*(usata per puro amore del genere e nostalgia da corsia di sorpasso)*

---

*Fatto con JavaScript, SVG, troppo caffè e un'irragionevole ottimismo nei confronti della fisica dei tronchi d'albero.*
