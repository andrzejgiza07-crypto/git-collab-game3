TESTY PRZEBIEGU GRY "UCIECZKA Z SERWEROWNI"
Podstawa: app.js, engine.js, index.html (WERSJA_ZAPISU = 2, MAKS_ENERGIA = 12)

1. Ładowanie plików (index.html, engine.js, app.js)
- index.html ładuje najpierw engine.js (defer), potem app.js (defer).
- engine.js definiuje POMIESZCZENIA (id 1..5), nowyStan(), kopiujStan(),
  nazwaPokoju(), opiszPokoj(), wykonajRegule(), zakonczUdanaTure(),
  eksportujStan() i walidujZapis().
- app.js inicjalizuje stanGry = nowyStan(), tworzy obiekt gra i wypisuje:
  "Gra gotowa. Wpisz gra.start(), aby rozpocząć."

2. Start i komendy informacyjne
- gra.start() -> ustawia stan początkowy (pokoj: 1, energia: 12, karta: false,
  bezpiecznik: false, zasilanie: false, temperatura: -5, klucz: false,
  koniec: false, wygrana: false), wypisuje nagłówek, energię, pomoc oraz
  opis pokoju 1 ("Na biurku leży karta dostępu."), zwraca kopię stanu.
- gra.pomoc() -> wypisuje listę komend i zasadę kosztu 1 energii.
- gra.status() -> wypisuje bieżące wartości pól i stan gry ("gra trwa" /
  "wygrana" / "przegrana"), zwraca kopię stanu.
- gra.mapa() -> wypisuje listę pomieszczeń 1..5 z "➡ " przy aktualnym pokoju.
- gra.rozejrzyj() -> wypisuje opiszPokoj(stanGry).

3. Ruch (gra.idz)
- "prawo" zwiększa numer pokoju o 1, "lewo" zmniejsza o 1.
- Wyjście poza 1..5 zwraca: "Nie możesz iść w tym kierunku. Na drodze jest ściana."
  (bez zmiany energii).
- Inny kierunek zwraca: 'Nieznany kierunek. Użyj "prawo" albo "lewo".'
  (bez zmiany energii).
- Udany ruch zmienia pokoj i odejmuje 1 energię (zakonczUdanaTure).

4. Akcje (gra.akcja) i przebieg wygranej
- Pokój 1 (Recepcja): gra.akcja("karta") -> karta = true, energia -1.
- Pokój 2 (Magazyn): gra.idz("prawo") -> energia -1; gra.akcja("bezpiecznik") ->
  bezpiecznik = true, energia -1.
- Pokój 3 (Serwerownia): gra.idz("prawo") -> energia -1; gra.akcja("napraw") ->
  bezpiecznik = false, zasilanie = true, energia -1.
- Pokój 4 (Chłodnia): gra.idz("prawo") -> energia -1;
  gra.akcja("ogrzewanie") -> temperatura +3 (-5 -> -2), energia -1;
  gra.akcja("ogrzewanie") -> temperatura +3 (-2 -> 1), energia -1;
  gra.akcja("klucz") -> wymaga temperatura > 0, ustawia klucz = true, energia -1.
- Pokój 5 (Wyjście): gra.idz("prawo") -> energia -1;
  gra.akcja("wyjdz") -> wymaga karta, zasilanie i klucz; ustawia
  wygrana = true, koniec = true, energia -1, dopisuje " WYGRANA! Drzwi są otwarte.".

5. Przegrana, koniec gry i reset
- Spadek energii do <= 0 bez wygranej ustawia energia = 0, koniec = true
  oraz dopisuje " PRZEGRANA! Zabrakło energii.".
- Gdy stan.koniec === true, ruchy i akcje (poza "reset") zwracają:
  "Gra jest zakończona. Możesz użyć resetu lub eksportu." bez zmiany stanu.
- gra.reset() -> wywołuje wykonajRegule z { typ: "reset" }, przywraca nowyStan()
  i wypisuje opis pokoju startowego.