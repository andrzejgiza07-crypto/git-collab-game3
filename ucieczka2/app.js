
// Aplikacja odpowiada za komunikację z graczem,
// czyli wyświetlanie komunikatów i obsługę komend.
// Silnik gry engine.js musi być wczytany wcześniej,
// ponieważ korzystamy z funkcji i danych, które tam zdefiniowaliśmy.

let stanGry = nowyStan();
// Tworzymy zmienną stanGry.
// Przechowuje ona aktualny stan rozgrywki.
// nowyStan() tworzy początkowy stan gry.

// Funkcja pokazWynik przyjmuje wynik działania reguły gry.
function pokazWynik(wynik) {
  stanGry = wynik.stan;
  // Aktualizujemy stan gry na podstawie wyniku.
  // wynik.stan zawiera nowy stan po wykonaniu komendy.

  console.log(wynik.komunikat);
  // Wyświetlamy graczowi komunikat, np. "Zabierasz kartę".
}

// Funkcja pokazPomoc wyświetla listę dostępnych komend.
function pokazPomoc() {
  console.log("=== UCIECZKA Z SERWEROWNI ===");
  // Wyświetlamy tytuł gry.

  console.log("gra.start() - nowa gra");
  // Informacja o komendzie rozpoczynającej grę.

  console.log("gra.status() - stan i ekwipunek");
  // Informacja o komendzie pokazującej stan gracza.

  console.log("gra.mapa() - mapa");
  // Informacja o komendzie wyświetlającej mapę.

  console.log("gra.rozejrzyj() - opis pokoju");
  // Informacja o komendzie opisującej aktualne pomieszczenie.

  console.log('gra.idz("prawo") lub gra.idz("lewo") - ruch');
  // Pokazujemy, jak poruszać się między pokojami.

  console.log('gra.akcja("karta") - zabierz kartę');
  // Komenda pozwalająca zabrać kartę dostępu.

  console.log('gra.akcja("bezpiecznik") - zabierz bezpiecznik');
  // Komenda pozwalająca zabrać bezpiecznik.

  console.log('gra.akcja("napraw") - napraw zasilanie');
  // Komenda naprawiająca zasilanie w serwerowni.

  console.log('gra.akcja("ogrzewanie") - podnieś temperaturę');
  // Komenda podnosząca temperaturę w chłodni.

  console.log('gra.akcja("klucz") - zabierz klucz z lodu');
  // Komenda pozwalająca zdobyć klucz po ogrzaniu chłodni.

  console.log('gra.akcja("wyjdz") - otwórz drzwi');
  // Komenda pozwalająca zakończyć grę zwycięstwem.

  console.log("gra.eksportuj() - eksportuje zapis JSON");
  // Informacja o zapisywaniu stanu gry do JSON.

  console.log("gra.importuj(tekst) - importuje zapis JSON");
  // Informacja o wczytywaniu zapisu z tekstu JSON.

  console.log("Poprawny ruch i udana akcja kosztują 1 energię.");
  // Wyjaśniamy graczowi zasadę zużywania energii.
}

// Tworzymy publiczny obiekt gra.
// Gracz będzie używał jego metod w konsoli.
const gra = {

  // Metoda start rozpoczyna nową grę.
  start() {
    stanGry = nowyStan();
    // Resetujemy stan gry do wartości początkowych.

    console.log("UCIECZKA Z SERWEROWNI.");
    // Wyświetlamy tytuł gry.

    console.log("Masz " + MAKS_ENERGIA + " jednostek energii.");
    // Informujemy gracza o początkowej energii.
    // MAKS_ENERGIA pochodzi z engine.js.

    pokazPomoc();
    // Wyświetlamy listę komend.

    this.rozejrzyj();
    // Wywołujemy metodę rozejrzyj z obiektu gra.
    // this oznacza tutaj obiekt gra.

    return { ...stanGry };
    // Zwracamy kopię aktualnego stanu gry.
    // ...stanGry kopiuje wszystkie właściwości obiektu.
  },

  // Udostępniamy funkcję pomocy jako metodę obiektu gra.
  pomoc: pokazPomoc,

  // Metoda status wyświetla informacje o stanie gracza.
  status() {
    console.log("Pokój: " + nazwaPokoju(stanGry.pokoj));
    // Wyświetlamy nazwę aktualnego pokoju.
    // nazwaPokoju() zamienia numer pokoju na nazwę.

    console.log("Energia: " + stanGry.energia);
    // Wyświetlamy ilość energii.

    console.log("Karta: " + (stanGry.karta ? "tak" : "nie"));
    // Jeśli karta jest true, wyświetlamy "tak".
    // Jeśli karta jest false, wyświetlamy "nie".
    // Operator ? : to operator warunkowy.

    console.log("Bezpiecznik: " + (stanGry.bezpiecznik ? "tak" : "nie"));
    // Informujemy, czy gracz posiada bezpiecznik.

    console.log("Zasilanie: " + (stanGry.zasilanie ? "działa" : "nie działa"));
    // Informujemy, czy zasilanie zostało naprawione.

    console.log("Temperatura chłodni: " + stanGry.temperatura + "°C");
    // Wyświetlamy aktualną temperaturę chłodni.

    console.log("Klucz: " + (stanGry.klucz ? "tak" : "nie"));
    // Informujemy, czy gracz zdobył klucz.

    console.log(
      "Stan gry: " +
      // Początek komunikatu o stanie gry.

      (stanGry.wygrana
        ? "wygrana"
        // Jeśli wygrana jest true, pokazujemy "wygrana".

        : stanGry.koniec
        ? "przegrana"
        // Jeśli gra się skończyła, ale nie została wygrana,
        // pokazujemy "przegrana".

        : "gra trwa")
        // W przeciwnym razie gra nadal trwa.
    );

    return { ...stanGry };
    // Zwracamy kopię stanu gry.
  },

  // Metoda mapa wyświetla wszystkie pomieszczenia.
  mapa() {
    console.log("=== MAPA ===");
    // Wyświetlamy nagłówek mapy.

    for (const pokoj of POMIESZCZENIA) {
      // Przechodzimy po wszystkich pokojach z tablicy POMIESZCZENIA.
      // const pokoj oznacza aktualny element tablicy.

      console.log(
        (pokoj.id === stanGry.pokoj ? "➡ " : "  ") +
        // Jeśli pokój jest aktualnym pokojem gracza,
        // wyświetlamy strzałkę.
        // W przeciwnym razie wyświetlamy spacje.

        pokoj.id + ". " + pokoj.nazwa
        // Wyświetlamy numer i nazwę pokoju.
      );
    }
  },

  // Metoda rozejrzyj opisuje aktualne pomieszczenie.
  rozejrzyj() {
    console.log(opiszPokoj(stanGry));
    // opiszPokoj() zwraca opis na podstawie stanu gry.
    // console.log() wyświetla ten opis.
  },

  // Metoda idz pozwala poruszać się po mapie.
  idz(kierunek) {
    const wynik = wykonajRegule(stanGry, {
      // Wywołujemy funkcję reguł z engine.js.
      // Przekazujemy aktualny stan gry.

      typ: "ruch",
      // Informujemy silnik, że komenda dotyczy ruchu.

      kierunek
      // Przekazujemy kierunek otrzymany od gracza.
      // Może to być "prawo" albo "lewo".
    });

    pokazWynik(wynik);
    // Aktualizujemy stan gry i wyświetlamy komunikat.

    return { ...stanGry };
    // Zwracamy kopię aktualnego stanu.
  },

  // Metoda akcja wykonuje akcję gracza.
  akcja(co) {
    const wynik = wykonajRegule(stanGry, {
      // Przekazujemy aktualny stan do silnika.

      typ: "akcja",
      // Informujemy silnik, że gracz wykonuje akcję.

      co
      // Przekazujemy nazwę akcji.
      // Przykłady: "karta", "napraw", "klucz".
    });

    pokazWynik(wynik);
    // Zapisujemy nowy stan i wyświetlamy komunikat.

    return { ...stanGry };
    // Zwracamy kopię stanu gry.
  },

  // Metoda reset rozpoczyna grę od nowa.
  reset() {
    const wynik = wykonajRegule(stanGry, {
      // Wywołujemy funkcję reguł.

      typ: "reset"
      // Przekazujemy typ komendy reset.
    });

    pokazWynik(wynik);
    // Aktualizujemy stan i pokazujemy komunikat.

    return { ...stanGry };
    // Zwracamy nowy stan gry.
  },

  // Metoda eksportuj zapisuje stan gry jako JSON.
  eksportuj() {
    const tekst = eksportujStan(stanGry);
    // eksportujStan() zamienia stan gry na tekst JSON.
    // Wynik zapisujemy w zmiennej tekst.

    console.log("Skopiuj poniższy tekst do pliku, np. zapis.json:, składnia polecenia gra.import(JSON.stringify(tutaj wklej))");
    // Informujemy gracza, co zrobić z zapisem.

    console.log(tekst);
    // Wyświetlamy gotowy tekst JSON.

    return tekst;
    // Zwracamy tekst JSON, aby można go było skopiować
    // lub przekazać do innej funkcji.
  },

  // Metoda importuj wczytuje zapis gry z tekstu JSON.
  importuj(tekst) {
    if (typeof tekst !== "string" || tekst.trim() === "") {
      // Sprawdzamy, czy argument jest tekstem.
      // trim() usuwa białe znaki z początku i końca.
      // Jeśli argument nie jest tekstem lub jest pusty,
      // import zostaje przerwany.

      console.log("Import anulowany: nie podano tekstu.");
      // Wyświetlamy informację o błędzie.

      return false;
      // Zwracamy false, czyli import się nie udał.
    }

    const wynik = walidujZapis(tekst);
    // Przekazujemy tekst do walidacji w engine.js.
    // Funkcja sprawdza, czy JSON i stan gry są poprawne.

    if (!wynik.ok) {
      // Jeśli walidacja się nie powiodła...

      console.log(wynik.komunikat);
      // Wyświetlamy powód odrzucenia zapisu.

      return false;
      // Kończymy import bez zmiany aktualnej gry.
    }

    // Podmiana następuje dopiero po pełnej walidacji.
    stanGry = wynik.stan;
    // Jeśli zapis jest poprawny, wczytujemy jego stan.
    // Aktualna rozgrywka zostaje zastąpiona zapisanym stanem.

    console.log(
      "Wczytano zapis. Pokój: " +
      // Wyświetlamy informację o wczytaniu zapisu.

      nazwaPokoju(stanGry.pokoj) +
      // Zamieniamy numer pokoju na jego nazwę.

      ", energia: " +
      // Dodajemy informację o energii.

      stanGry.energia +
      // Wyświetlamy aktualną ilość energii.

      "."
      // Kończymy komunikat kropką.
    );

    return true;
    // Zwracamy true, ponieważ import zakończył się sukcesem.
  }
};

// Ten komunikat pojawia się po załadowaniu app.js.
console.log("Gra gotowa. Wpisz gra.start(), aby rozpocząć.");
// Informujemy gracza, że aplikacja jest gotowa do użycia.
