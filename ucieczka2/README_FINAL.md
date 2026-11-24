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

* index.html
  Prosty plik startowy HTML5 z kodowaniem UTF-8. Ładuje skrypty `engine.js` 
  oraz `app.js` z użyciem atrybutu `defer` (zapewniając poprawną kolejność 
  wykonywania) i wyświetla w przeglądarce skróconą instrukcję uruchomienia.

* engine.js
  Silnik gry zawierający czystą logikę biznesową. Definiuje stałe konfiguracyjne
  (WERSJA_ZAPISU = 2, MAKS_ENERGIA = 12), dane pomieszczeń, generator stanu 
  początkowego (nowyStan), funkcję kopiowania (kopiujStan), deterministyczną 
  maszynę reguł (wykonajRegule), kalkulację zużycia energii (zakonczUdanaTure)
  oraz kompletny system eksportu i walidacji zapisu (eksportujStan, walidujZapis).
  Silnik nie korzysta z console.log i nie modyfikuje obiektów wejściowych.

* app.js
  Warstwa aplikacji konsolowej. Zarządza zmienną globalną `stanGry`, udostępnia 
  publiczny obiekt komend `gra` (API dla gracza) oraz odpowiada za komunikację
  z użytkownikiem poprzez formatowanie i wypisywanie komunikatów w konsoli.


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

* ID 1: Recepcja
  - Cel: Zabrana karty dostępu.
  - Akcja: gra.akcja("karta")

* ID 2: Magazyn
  - Cel: Zabranie bezpiecznika.
  - Akcja: gra.akcja("bezpiecznik")

* ID 3: Serwerownia
  - Cel: Naprawa zasilania z użyciem bezpiecznika.
  - Akcja: gra.akcja("napraw")

* ID 4: Chłodnia
  - Cel: Podniesienie temperatury i zdobycie klucza z lodu.
  - Akcja 1: gra.akcja("ogrzewanie") -> podnosi temperaturę o +3°C (od -5°C).
  - Akcja 2: gra.akcja("klucz") -> zabranie klucza (wymaga temperatury > 0°C).

* ID 5: Wyjście
  - Cel: Otwarcie drzwi wyjściowych i ukończenie gry.
  - Akcja: gra.akcja("wyjdz") (wymaga karty, naprawionego zasilania i klucza).


--------------------------------------------------------------------------------
4. ZASADY ROZGRYWKI I ENERGIA
--------------------------------------------------------------------------------

* Pula startowa wynosi 12 punktów energii (MAKS_ENERGIA = 12).
* Każdy wykonany poprawny ruch oraz każda udana akcja zabierają 1 punkt energii.
* Błędne komendy, proby wykonania niemożliwych akcji lub ruchy w ścianę nie
  pobierają energii.
* Porażka następuje w momencie, gdy energia spadnie do 0 przed otwarciem drzwi 
  wyjściowych (koniec: true, wygrana: false).
* Wygrana następuje w momencie wykonania akcji gra.akcja("wyjdz") przy posiadaniu
  karty, klucza i sprawnym zasilaniu. Wygrana jest możliwa również na ostatnim
  punkcie energii.
* Po zakończeniu gry (koniec === true) wszelkie dalsze interakcje są blokowane.
  W celu ponownego zagrania należy użyć komendy gra.reset() lub gra.start().


--------------------------------------------------------------------------------
5. API I PEŁNA LISTA KOMEND (`gra`)
--------------------------------------------------------------------------------

+-------------------------+----------------------------------------------------+
| Komenda                 | Opis i działanie                                   |
+-------------------------+----------------------------------------------------+
| gra.start()             | Rozpoczyna nową grę, resetuje stan i wyświetla opis|
| gra.pomoc()             | Wyświetla listę dostępnych komend i zasadę energii |
| gra.status()            | Wyświetla obecny pokój, stan ekwipunku i parametry |
| gra.mapa()              | Rysuje tekstową mapę z zaznaczeniem obecnej pozycji|
| gra.rozejrzyj()         | Ponownie wyświetla szczegółowy opis pokoju         |
| gra.idz("prawo"/"lewo") | Wykonuje ruch do sąsiedniego pomieszczenia         |
| gra.akcja(co)           | Wykonuje akcję ("karta", "bezpiecznik", "napraw",  |
|                         | "ogrzewanie", "klucz", "wyjdz")                    |
| gra.reset()             | Resetuje stan gry bez wywoływania powitania        |
| gra.eksportuj()         | Zwraca ciąg JSON ze stanem gry do skopiowania      |
| gra.importuj(tekst)     | Wczytuje i waliduje podany ciąg znaków JSON        |
+-------------------------+----------------------------------------------------+


--------------------------------------------------------------------------------
6. STRUKTURA ZAPISU JSON I WALIDACJA
--------------------------------------------------------------------------------

Format wygenerowanego zapisu (WERSJA_ZAPISU = 2):

{
  "wersja": 2,
  "stan": {
    "pokoj": 1,
    "energia": 12,
    "karta": false,
    "bezpiecznik": false,
    "zasilanie": false,
    "temperatura": -5,
    "klucz": false,
    "koniec": false,
    "wygrana": false
  }
}

Funkcja walidujZapis(tekst) w engine.js przed wczytaniem stanu weryfikuje:
1. Poprawność składniową JSON.
2. Zgodność numeru wersji (wymagana wersja: 2).
3. Obowiązkowe istnienie i brak nadmiarowych pól w obiekcie `stan`.
4. Typy danych oraz akceptowalne zakresem wartości (np. pokoj: 1..5, energia: 0..12).
5. Spójność logiczną stanu (m.in. zakaz posiadania klucza przy temp <= 0°C, 
   brak bezpiecznika w ekwipunku gdy zasilanie jest aktywne, wymóg 0 energii
   w stanie przegranej).


--------------------------------------------------------------------------------
7. PRZYKŁADOWA SOLUCJA (OPTYMALNE PRZEJŚCIE)
--------------------------------------------------------------------------------

Wpisz po kolei w konsoli przeglądarki:

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