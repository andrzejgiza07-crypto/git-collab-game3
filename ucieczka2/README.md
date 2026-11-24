================================================================================
                        UCIECZKA Z SERWEROWNI — README
================================================================================

Tekstowa gra przygodowa uruchamiana w konsoli przeglądarki (lub dowolnym
środowisku uruchomieniowym JavaScript po wczytaniu skryptów). Projekt opiera
się na czystych funkcjach zmiany stanu, logice bez efektów ubocznych oraz
walidowanym eksporcie i imporcie stanów zapisu w formacie JSON.


--------------------------------------------------------------------------------
1. ARCHITEKTURA PROJEKTU
--------------------------------------------------------------------------------

Projekt został podzielony na rozdzielne warstwy logiki, interfejsu i HTML:

- index.html
  Plik startowy HTML5 z kodowaniem UTF-8 (tytuł: "Ucieczka z serwerowni — JS1").
  Ładuje skrypty `engine.js` oraz `app.js` z użyciem atrybutu `defer`
  (zapewniając poprawną kolejność wykonywania) i wyświetla w przeglądarce
  skróconą instrukcję uruchomienia oraz podstawowe komendy (`gra.start()`,
  `gra.pomoc()`, `gra.status()`, `gra.mapa()`, `gra.idz("prawo")`,
  `gra.akcja("karta")`).

- engine.js
  Silnik gry zawierający czystą logikę biznesową. Definiuje stałe konfiguracyjne
  (WERSJA_ZAPISU = 2, MAKS_ENERGIA = 15), tablicę pomieszczeń (POMIESZCZENIA),
  generator stanu początkowego (nowyStan), funkcję kopiowania (kopiujStan),
  wyszukiwanie nazwy pokoju (nazwaPokoju), generator opisów kontekstowych
  (opiszPokoj), deterministyczną maszynę reguł (wykonajRegule), kalkulację
  zużycia energii (zakonczUdanaTure) oraz system eksportu i walidacji zapisu
  (eksportujStan, walidujZapis). Silnik nie korzysta z console.log i nie
  modyfikuje obiektów wejściowych.

- app.js
  Warstwa aplikacji konsolowej. Zarządza zmienną globalną `stanGry`, udostępnia
  publiczny obiekt komend `gra` (API dla gracza) oraz odpowiada za komunikację
  z użytkownikiem poprzez formatowanie i wypisywanie komunikatów w konsoli.
  Po załadowaniu skryptu wyświetla komunikat powitalny z instrukcją startu.


--------------------------------------------------------------------------------
2. INSTRUKCJA URUCHOMIENIA
--------------------------------------------------------------------------------

1. Umieść pliki `index.html`, `engine.js` oraz `app.js` w jednym katalogu.
2. Otwórz plik `index.html` w dowolnej nowożytnej przeglądarce internetowej.
3. Otwórz Narzędzia Deweloperskie (F12 lub Ctrl+Shift+I / Cmd+Option+I).
4. Przejdź do zakładki "Console" (Konsola).
5. Wpisz komendę inicjującą rozgrywkę:

   gra.start()


--------------------------------------------------------------------------------
3. MAPA I POMIESZCZENIA
--------------------------------------------------------------------------------

Gracz porusza się liniowo pomiędzy 5 pomieszczeniami za pomocą komend
gra.idz("prawo") oraz gra.idz("lewo"):

[1. Recepcja] <---> [2. Magazyn] <---> [3. Serwerownia] <---> [4. Chłodnia] <---> [5. Wyjście]

Wykaz pomieszczeń i interakcji:

- ID 1: Recepcja
  - Opis bazowy: "Na biurku leży karta dostępu."
  - Cel: Zabranie karty dostępu.
  - Akcja: gra.akcja("karta")

- ID 2: Magazyn
  - Opis bazowy: "Na półce leży bezpiecznik."
  - Cel: Zabranie bezpiecznika (niemożliwe po zamontowaniu go w Serwerowni).
  - Akcja: gra.akcja("bezpiecznik")

- ID 3: Serwerownia
  - Opis bazowy: "Tutaj możesz naprawić zasilanie."
  - Cel: Naprawa zasilania z użyciem posiadanego bezpiecznika (zużywa
    bezpiecznik z ekwipunku i ustawia zasilanie na aktywne).
  - Akcja: gra.akcja("napraw")

- ID 4: Chłodnia
  - Opis bazowy: "W lodzie znajduje się klucz. Temperatura wynosi -5°C."
  - Cel: Roztopienie lodu poprzez podniesienie temperatury powyżej 0°C i zabranie
    zamrożonego klucza.
  - Akcja 1: gra.akcja("ogrzewanie")
    -> Podnosi temperaturę w chłodni o +3°C (startowo -5°C -> -2°C -> +1°C).
    -> Wymaga dwukrotnego użycia, aby przekroczyć próg 0°C.
    -> Gdy temperatura jest już > 0°C, ponowne użycie nie zużywa energii
       i zwraca komunikat: "W chłodni jest już wystarczająco ciepło."
  - Akcja 2: gra.akcja("klucz")
    -> Pozwala wyjąć klucz z roztopionego lodu.
    -> Dostępna wyłącznie w Chłodni, gdy temperatura > 0°C i gracz nie ma
       jeszcze klucza.

- ID 5: Wyjście
  - Opis bazowy: "Tutaj znajdują się drzwi wyjściowe."
  - Cel: Otwarcie drzwi wyjściowych i ukończenie gry.
  - Akcja: gra.akcja("wyjdz") (wymaga posiadania karty, działającego zasilania
    oraz klucza z chłodni).


--------------------------------------------------------------------------------
4. ZASADY ROZGRYWKI I ENERGIA
--------------------------------------------------------------------------------

- Pula startowa wynosi 15 punktów energii (MAKS_ENERGIA = 15).
- Każdy wykonany poprawny ruch oraz każda udana akcja zabierają 1 punkt energii.
- Błędne komendy, próby wykonania niemożliwych akcji (np. ogrzewania przy
  temperaturze > 0°C lub zabrania klucza w lodzie) oraz ruchy w ścianę nie
  pobierają energii.
- Porażka następuje w momencie, gdy energia spadnie do 0 przed otwarciem drzwi
  wyjściowych (koniec: true, wygrana: false).
- Wygrana następuje w momencie wykonania akcji gra.akcja("wyjdz") przy posiadaniu
  karty, klucza i sprawnym zasilaniu. Wygrana jest sprawdzana przed limitem
  energii, więc jest możliwa również na ostatnim (1.) punkcie energii.
- Po zakończeniu gry (koniec === true) wszelkie dalsze ruchy i akcje są
  blokowane (dozwolone pozostają m.in. gra.status(), gra.eksportuj(),
  gra.reset() oraz gra.start()).


--------------------------------------------------------------------------------
5. API I PEŁNA LISTA KOMEND (`gra`)
--------------------------------------------------------------------------------

+-------------------------+----------------------------------------------------+
| Komenda                 | Opis i działanie                                   |
+-------------------------+----------------------------------------------------+
| gra.start()             | Rozpoczyna nową grę, resetuje stan, wypisuje pomoc |
|                         | oraz opis pokoju; zwraca kopię obiektu `stanGry`   |
| gra.pomoc()             | Wyświetla listę dostępnych komend i zasadę energii |
| gra.status()            | Wyświetla obecny pokój, energię, ekwipunek, stan   |
|                         | zasilania, temperaturę chłodni oraz status gry     |
| gra.mapa()              | Rysuje tekstową mapę z zaznaczeniem (➡) pozycji    |
| gra.rozejrzyj()         | Ponownie wyświetla kontekstowy opis pokoju         |
| gra.idz("prawo"/"lewo") | Wykonuje ruch do sąsiedniego pomieszczenia         |
| gra.akcja(co)           | Wykonuje akcję ("karta", "bezpiecznik", "napraw",  |
|                         | "ogrzewanie", "klucz", "wyjdz")                    |
| gra.reset()             | Resetuje stan gry i wyświetla opis pokoju startu   |
| gra.eksportuj()         | Generuje sformatowany JSON stanu gry, wypisuje w   |
|                         | konsoli wskazówkę dot. zapisu/importu i zwraca str |
| gra.importuj(tekst)     | Wczytuje i waliduje zapis przekazany jako string   |
|                         | JSON; zwraca `true` (sukces) lub `false` (błąd)    |
+-------------------------+----------------------------------------------------+


--------------------------------------------------------------------------------
6. EKSPORT, IMPORT I WALIDACJA ZAPISU JSON
--------------------------------------------------------------------------------

6.1. Działanie funkcji `gra.eksportuj()` oraz `gra.importuj(tekst)`:

- Wywołanie `gra.eksportuj()` serializuje obiekt `{ wersja: 2, stan: stanGry }`
  do czytelnego ciągu znaków JSON (wcięcie 2 spacje), zwraca go jako string oraz
  wyświetla w konsoli podpowiedź dla gracza:
  "Skopiuj poniższy tekst do pliku, np. zapis.json:, składnia polecenia
   gra.import(JSON.stringify(tutaj wklej))"
- Uwaga praktyczna dotycząca importu w konsoli:
  Właściwa nazwa metody w obiekcie `gra` to `gra.importuj(tekst)` i wymaga ona
  przekazania argumentu typu `string` (niepustego tekstu JSON):
  - Przekazanie skopiowanego tekstu w pojedynczych cudzysłowach / backtickach:
    gra.importuj(`{ "wersja": 2, "stan": { ... } }`)
  - Lub przekazanie obiektu JS po konwersji przez `JSON.stringify(...)`:
    gra.importuj(JSON.stringify({ "wersja": 2, "stan": { ... } }))
  - Bezpośrednie przypisanie wyniku eksportu do zmiennej:
    const zapis = gra.eksportuj();
    gra.importuj(zapis);

6.2. Format wygenerowanego zapisu (WERSJA_ZAPISU = 2):

{
  "wersja": 2,
  "stan": {
    "pokoj": 1,
    "energia": 15,
    "karta": false,
    "bezpiecznik": false,
    "zasilanie": false,
    "temperatura": -5,
    "klucz": false,
    "koniec": false,
    "wygrana": false
  }
}

6.3. Reguły walidacji (`walidujZapis(tekst)` w `engine.js`):

Przed nadpisaniem aktualnego `stanGry` funkcja sprawdza:
1. Czy podany argument jest niepustym ciągiem znaków (`string`) i poprawnym
   obiektem JSON (nie tablicą ani wartością prymitywną).
2. Zgodność numeru wersji (`wersja === 2`).
3. Obecność wszystkich 9 wymaganych pól w obiekcie `stan` i brak pól nadmiarowych.
4. Typy i dopuszczalne zakresy wartości:
   - `pokoj`: liczba całkowita od 1 do 5,
   - `energia`: liczba całkowita od 0 do 15 (`MAKS_ENERGIA`),
   - `temperatura`: liczba całkowita od -5 do 1,
   - `karta`, `bezpiecznik`, `zasilanie`, `klucz`, `koniec`, `wygrana`: `boolean`.
5. Spójność logiczną stanu gry:
   - brak klucza (`klucz === true`), gdy `temperatura <= 0`,
   - brak bezpiecznika w ekwipunku (`bezpiecznik === true`), gdy `zasilanie === true`,
   - w stanie wygranej (`wygrana === true`) wymagane są: `koniec === true`,
     `pokoj === 5`, `karta === true`, `zasilanie === true`, `klucz === true`,
   - w stanie przegranej (`koniec === true && !wygrana`) `energia` musi wynosić `0`,
   - w trakcie trwania gry (`!koniec`) `energia` nie może wynosić `0`.


--------------------------------------------------------------------------------
7. PRZYKŁADOWA SOLUCJA (OPTYMALNE PRZEJŚCIE)
--------------------------------------------------------------------------------

Wpisz po kolei w konsoli przeglądarki (zużywa 11 z 15 punktów energii):

gra.start();
gra.akcja("karta");
gra.idz("prawo");
gra.akcja("bezpiecznik");
gra.idz("prawo");
gra.akcja("napraw");
gra.idz("prawo");
gra.akcja("ogrzewanie");
gra.akcja("ogrzewanie");
gra.akcja("klucz");
gra.idz("prawo");
gra.akcja("wyjdz");
================================================================================