# Ucieczka z serwerowni — JS1

## Uruchomienie
1. Umieść `index.html`, `engine.js` i `app.js` w tym samym folderze.
2. Otwórz `index.html` dwuklikiem w przeglądarce.
3. Otwórz konsolę przeglądarki (zwykle F12 → Console).
4. Wpisz `gra.start()`.

Nie potrzeba Node.js, npm, serwera, modułów ES ani `localStorage`.

## Komendy
- `gra.start()` — rozpoczyna grę od początku.
- `gra.pomoc()` — pokazuje instrukcję.
- `gra.status()` — pokazuje stan i ekwipunek.
- `gra.mapa()` — pokazuje pomieszczenia i aktualne położenie.
- `gra.rozejrzyj()` — opisuje bieżące pomieszczenie.
- `gra.idz("prawo")` / `gra.idz("lewo")` — ruch.
- `gra.akcja("karta")` — zabiera kartę w recepcji.
- `gra.akcja("bezpiecznik")` — zabiera bezpiecznik w magazynie.
- `gra.akcja("napraw")` — montuje bezpiecznik w serwerowni.
- `gra.akcja("wyjdz")` — otwiera drzwi w pokoju wyjściowym.
- `gra.eksportuj()` — zwraca tekst JSON; skopiuj go ręcznie do pliku.
- `gra.importuj(tekst)` — importuje tekst JSON.
- `gra.reset()` — resetuje grę.

## Zasady
Masz 10 energii. Każdy udany ruch i każda udana akcja kosztują 1 energię. Nieudane akcje, błędne komendy i ruch w ścianę są darmowe. Aby wygrać, zabierz kartę w recepcji, zabierz bezpiecznik w magazynie, napraw zasilanie w serwerowni i otwórz drzwi przy wyjściu. Wygrana na ostatnim punkcie energii liczy się jako wygrana. Po zakończeniu ruchy i akcje nie zmieniają stanu; reset i eksport nadal działają.

## Zapis i wczytywanie
1. Wpisz `const zapis = gra.eksportuj()`.
2. Skopiuj tekst JSON z konsoli do edytora tekstu i zapisz go np. jako `zapis.json` na pendrivie.
3. Po odświeżeniu strony otwórz plik `zapis.json`, skopiuj całą zawartość.
4. W konsoli wpisz `gra.importuj(\`WKLEJ_TUTAJ_TEKST_JSON\`)`, zastępując tekst przykładowy skopiowaną zawartością. Przy długim JSON-ie wygodniej wkleić go bezpośrednio jako argument funkcji.
5. Import sprawdza składnię, wersję, pola, typy, zakresy i zależności. Jeśli zapis jest niepoprawny lub tekst jest pusty, bieżący stan pozostaje bez zmian.

Format zapisu ma numer wersji `1`. Po zmianie struktury zapisu trzeba zaktualizować wersję i walidator.

## Udokumentowane próby
1. **Lewa granica:** po `gra.start()` wpisz `gra.idz("lewo")`. Pokój i energia nie zmieniają się; pojawia się komunikat o ścianie.
2. **Ponowne pobranie:** `gra.akcja("karta")`, a następnie ponownie `gra.akcja("karta")`. Druga próba jest odrzucona i nie zużywa energii.
3. **Naprawa:** wykonaj `gra.akcja("karta")`, przejdź do magazynu, zabierz bezpiecznik, przejdź do serwerowni i wpisz `gra.akcja("napraw")`. Zasilanie działa, bezpiecznik znika z ekwipunku, energia spada o 1.
4. **Eksport/import:** po wykonaniu kilku ruchów wpisz `gra.eksportuj()`, skopiuj JSON do pliku, odśwież stronę i zaimportuj tekst przez `gra.importuj("...")`. Stan powinien być taki sam jak przy eksporcie.
5. **Uszkodzony JSON:** podczas aktywnej gry wpisz `gra.importuj("{")`. Pojawia się błąd, a stan pozostaje bez zmian.
6. **Zła wersja:** spróbuj importu JSON z `"wersja": 99`. Import zostaje odrzucony, stan się nie zmienia.
7. **Zły typ pola:** ustaw w JSON `energia` na tekst `"dużo"`. Import zostaje odrzucony.
8. **Pusty import:** wpisz `gra.importuj("")`. Import zostaje anulowany, stan się nie zmienia.
9. **Wygrana:** rozpocznij grę i wykonaj kartę, przejście do magazynu, bezpiecznik, przejście do serwerowni, naprawę, przejście do wyjścia i `gra.akcja("wyjdz")`. Gra kończy się wygraną.
10. **Czystość reguł:** w konsoli wykonaj `const kopia = gra.status(); const oryginal = {...kopia}; wykonajRegule(kopia, {typ:"ruch", kierunek:"lewo"});` i porównaj `kopia` z `oryginal`. Funkcja reguł nie zmienia przekazanego obiektu.

## Decyzja projektowa
Oddzieliliśmy silnik (`engine.js`) od aplikacji (`app.js`). Alternatywą był jeden plik, który byłby prostszy na początku, ale trudniejszy do rozwijania i testowania. Dwa zwykłe skrypty nie tworzą prywatnego środowiska — ich funkcje i zmienne są współdzielone, ale podział ułatwia rozdzielenie zasad gry od komunikatów.

## Rozszerzenia
Nie dodano dodatkowego pokoju ani nowej mechaniki, żeby zachować proste reguły i format zapisu wersji 1.
