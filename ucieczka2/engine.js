
/*
 * Silnik gry:
 * - przechowuje dane gry,
 * - tworzy początkowy stan,
 * - sprawdza reguły,
 * - wykonuje ruchy i akcje,
 * - zapisuje oraz sprawdza zapis JSON.
 *
 * Ten plik nie wyświetla tekstu w konsoli.
 * Nie korzysta z console.log().
 * Główna funkcja nie zmienia bezpośrednio stanu,
 * który otrzymuje jako argument.
 */

// Numer wersji formatu zapisu gry.
// Dzięki temu można rozpoznać, czy zapis pochodzi
// z odpowiedniej wersji silnika.
const WERSJA_ZAPISU = 2;

// Maksymalna liczba energii, którą gracz może mieć na początku.
const MAKS_ENERGIA = 15;

// Lista wszystkich pomieszczeń w grze.
// Każde pomieszczenie ma:
// id - numer pomieszczenia,
// nazwa - nazwę wyświetlaną graczowi,
// opis - podstawowy opis miejsca.
const POMIESZCZENIA = [
  {
    id: 1,
    nazwa: "Recepcja",
    opis: "Na biurku leży karta dostępu."
  },
  {
    id: 2,
    nazwa: "Magazyn",
    opis: "Na półce leży bezpiecznik."
  },
  {
    id: 3,
    nazwa: "Serwerownia",
    opis: "Tutaj możesz naprawić zasilanie."
  },
  {
    id: 4,
    nazwa: "Chłodnia",
    opis: "W lodzie znajduje się klucz. Temperatura wynosi -5°C."
  },
  {
    id: 5,
    nazwa: "Wyjście",
    opis: "Tutaj znajdują się drzwi wyjściowe."
  }
];

// Funkcja tworzy nowy, początkowy stan gry.
// Wywołujemy ją na początku gry lub podczas resetowania.
function nowyStan() {
  return {
    pokoj: 1,                  // Gracz zaczyna w recepcji.
    energia: MAKS_ENERGIA,    // Gracz otrzymuje maksymalną energię.
    karta: false,             // Gracz jeszcze nie ma karty.
    bezpiecznik: false,       // Gracz jeszcze nie ma bezpiecznika.
    zasilanie: false,         // Zasilanie serwerowni jest wyłączone.
    temperatura: -5,          // Początkowa temperatura chłodni.
    klucz: false,             // Gracz jeszcze nie ma klucza.
    koniec: false,             // Gra jeszcze się nie zakończyła.
    wygrana: false             // Gracz jeszcze nie wygrał.
  };
}

// Funkcja tworzy kopię obiektu stanu.
// Operator ... nazywa się operatorem spread.
// Kopiujemy właściwości obiektu do nowego obiektu.
// Dzięki temu nie zmieniamy oryginalnego stanu.
function kopiujStan(stan) {
  return { ...stan };
}

// Funkcja znajduje nazwę pomieszczenia na podstawie numeru.
// find() przeszukuje tablicę POMIESZCZENIA.
// p oznacza pojedynczy element tablicy.
function nazwaPokoju(numer) {
  const pokoj = POMIESZCZENIA.find(p => p.id === numer);

  // Jeśli znaleziono pomieszczenie, zwracamy jego nazwę.
  // Jeśli nie, zwracamy tekst zastępczy.
  return pokoj ? pokoj.nazwa : "Nieznane pomieszczenie";
}

// Funkcja zwraca opis aktualnego pomieszczenia.
// Opis zależy od tego, co gracz już zrobił.
function opiszPokoj(stan) {
  // switch sprawdza numer aktualnego pomieszczenia.
  switch (stan.pokoj) {

    // RECEPCJA
    case 1:
      // Operator ? : to skrócony zapis instrukcji if/else.
      // Jeśli karta została zabrana, pokazujemy inny opis.
      return stan.karta
        ? "Karta została już zabrana."
        : "Na biurku leży karta dostępu.";

    // MAGAZYN
    case 2:
      // Najpierw sprawdzamy, czy zasilanie już działa.
      return stan.zasilanie
        ? "Bezpiecznik jest zamontowany, a zasilanie działa."

        // Jeśli zasilanie nie działa, sprawdzamy,
        // czy gracz ma bezpiecznik w ekwipunku.
        : stan.bezpiecznik
        ? "Masz bezpiecznik w kieszeni."

        // Jeśli nie ma bezpiecznika, nadal leży na półce.
        : "Na półce leży bezpiecznik.";

    // SERWEROWNIA
    case 3:
      // Jeśli zasilanie działa, pokazujemy ten komunikat.
      return stan.zasilanie
        ? "Zasilanie działa."

        // Jeśli gracz ma bezpiecznik, może naprawić zasilanie.
        : stan.bezpiecznik
        ? "Masz bezpiecznik. Możesz naprawić zasilanie."

        // W przeciwnym razie musi znaleźć bezpiecznik.
        : "Brak zasilania. Potrzebujesz bezpiecznika.";

    // CHŁODNIA
    case 4:

      // Jeśli gracz już zabrał klucz,
      // pokazujemy informację o zabranym kluczu.
      if (stan.klucz) {
        return "Zabrałeś już klucz z chłodni. Temperatura: " +
          stan.temperatura + "°C.";
      }

      // Jeśli temperatura jest wyższa niż 0,
      // gracz może wyjąć klucz z lodu.
      if (stan.temperatura > 0) {
        return "Lód się roztopił! Możesz zabrać klucz. Temperatura: " +
          stan.temperatura + "°C.";
      }

      // Jeśli temperatura wynosi 0 lub mniej,
      // klucz nadal jest zamarznięty.
      return "W lodzie znajduje się klucz. Jest za zimno, aby go wyjąć. Temperatura: " +
        stan.temperatura + "°C.";

    // WYJŚCIE
    case 5:
      // Sprawdzamy, czy gracz ma wszystkie potrzebne przedmioty
      // i czy zasilanie zostało naprawione.
      return stan.karta && stan.zasilanie && stan.klucz
        ? "Masz kartę, działające zasilanie i klucz. Możesz otworzyć drzwi."
        : "Wyjście jest zamknięte. Potrzebujesz karty, działającego zasilania i klucza.";

    // Jeśli numer pomieszczenia nie pasuje do żadnego case.
    default:
      return "Nieznane pomieszczenie.";
  }
}

// Główna funkcja silnika gry.
// Przyjmuje:
// stanWejsciowy - aktualny stan gry,
// komenda - polecenie gracza.
//
// Zwraca nowy stan i komunikat.
// Nie zmienia oryginalnego stanu wejściowego.
function wykonajRegule(stanWejsciowy, komenda) {

  // Tworzymy kopię stanu, aby pracować na nowym obiekcie.
  const stan = kopiujStan(stanWejsciowy);

  // Sprawdzamy, czy komenda istnieje
  // i czy jej typ jest tekstem.
  if (!komenda || typeof komenda.typ !== "string") {
    return {
      stan,
      komunikat: "Nieprawidłowa komenda."
    };
  }

  // RESET GRY
  // Jeśli typ komendy to reset, tworzymy nowy stan.
  if (komenda.typ === "reset") {
    const nowy = nowyStan();

    // Zwracamy nowy stan i opis początkowego pomieszczenia.
    return {
      stan: nowy,
      komunikat: "Gra rozpoczęta od nowa. " + opiszPokoj(nowy)
    };
  }

  // Jeśli gra jest zakończona,
  // nie pozwalamy wykonywać kolejnych akcji.
  if (stan.koniec) {
    return {
      stan,
      komunikat: "Gra jest zakończona. Możesz użyć resetu lub eksportu."
    };
  }

  // RUCH MIĘDZY POMIESZCZENIAMI
  if (komenda.typ === "ruch") {

    // Na początku zakładamy, że gracz pozostaje w tym samym pokoju.
    let nastepny = stan.pokoj;

    // Jeśli kierunek to prawo, przechodzimy do kolejnego pokoju.
    if (komenda.kierunek === "prawo") {
      nastepny += 1;

    // Jeśli kierunek to lewo, przechodzimy do poprzedniego pokoju.
    } else if (komenda.kierunek === "lewo") {
      nastepny -= 1;

    // Jeśli podano inny kierunek, zwracamy błąd.
    } else {
      return {
        stan,
        komunikat: 'Nieznany kierunek. Użyj "prawo" albo "lewo".'
      };
    }

    // Sprawdzamy, czy następny pokój istnieje.
    // Nie można wyjść poza zakres od 1 do liczby pomieszczeń.
    if (nastepny < 1 || nastepny > POMIESZCZENIA.length) {
      return {
        stan,
        komunikat: "Nie możesz iść w tym kierunku. Na drodze jest ściana."
      };
    }

    // Zapisujemy nowy numer pokoju w kopii stanu.
    stan.pokoj = nastepny;

    // Ruch był poprawny, więc kończymy udaną turę.
    // Funkcja odejmie energię i zwróci komunikat.
    return zakonczUdanaTure(stan, opiszPokoj(stan));
  }

  // Jeśli komenda nie jest ruchem ani resetem,
  // musi być akcją.
  if (komenda.typ !== "akcja") {
    return {
      stan,
      komunikat: "Nieznany typ komendy."
    };
  }

  // OBSŁUGA AKCJI
  // switch sprawdza, jaką akcję chce wykonać gracz.
  switch (komenda.co) {

    // AKCJA: ZABRANIE KARTY
    case "karta":

      // Karta może być zabrana tylko w recepcji
      // i tylko wtedy, gdy gracz jeszcze jej nie ma.
      if (stan.pokoj !== 1 || stan.karta) {
        return {
          stan,
          komunikat: "Tutaj nie ma karty do zabrania."
        };
      }

      // Zaznaczamy, że gracz zdobył kartę.
      stan.karta = true;

      // Udana akcja kończy turę i odejmuje energię.
      return zakonczUdanaTure(
        stan,
        "Zabierasz kartę dostępu."
      );

    // AKCJA: ZABRANIE BEZPIECZNIKA
    case "bezpiecznik":

      // Bezpiecznik można zabrać tylko w magazynie.
      // Nie można zabrać go ponownie.
      // Nie można też zabrać go po naprawie zasilania.
      if (
        stan.pokoj !== 2 ||
        stan.bezpiecznik ||
        stan.zasilanie
      ) {
        return {
          stan,
          komunikat: "Nie możesz zabrać bezpiecznika."
        };
      }

      // Zapisujemy, że bezpiecznik jest w ekwipunku.
      stan.bezpiecznik = true;

      return zakonczUdanaTure(
        stan,
        "Zabierasz bezpiecznik."
      );

    // AKCJA: NAPRAWA ZASILANIA
    case "napraw":

      // Naprawa jest możliwa tylko w serwerowni.
      // Gracz musi mieć bezpiecznik.
      // Zasilanie nie może być już naprawione.
      if (
        stan.pokoj !== 3 ||
        !stan.bezpiecznik ||
        stan.zasilanie
      ) {
        return {
          stan,
          komunikat: "Nie możesz naprawić zasilania. Potrzebujesz bezpiecznika w serwerowni."
        };
      }

      // Bezpiecznik zostaje zużyty, czyli zamontowany.
      stan.bezpiecznik = false;

      // Zasilanie zostaje włączone.
      stan.zasilanie = true;

      return zakonczUdanaTure(
        stan,
        "Montujesz bezpiecznik i naprawiasz zasilanie."
      );

    // AKCJA: OGRZEWANIE CHŁODNI
    case "ogrzewanie":

      // Ogrzewanie można uruchomić tylko w chłodni.
      if (stan.pokoj !== 4) {
        return {
          stan,
          komunikat: "Nie jesteś w chłodni."
        };
      }

      // Jeśli temperatura jest już powyżej 0,
      // nie ma potrzeby dalszego ogrzewania.
      if (stan.temperatura > 0) {
        return {
          stan,
          komunikat: "W chłodni jest już wystarczająco ciepło."
        };
      }

      // Podnosimy temperaturę o 3 stopnie.
      stan.temperatura += 3;

      // Wyświetlamy aktualną temperaturę.
      return zakonczUdanaTure(
        stan,
        "Podnosisz temperaturę. Teraz wynosi " +
          stan.temperatura + "°C."
      );

    // AKCJA: ZABRANIE KLUCZA
    case "klucz":

      // Klucz znajduje się w chłodni.
      if (stan.pokoj !== 4) {
        return {
          stan,
          komunikat: "Musisz być w chłodni, aby zabrać klucz."
        };
      }

      // Temperatura musi być większa niż 0°C.
      if (stan.temperatura <= 0) {
        return {
          stan,
          komunikat: "Jest za zimno! Podnieś temperaturę powyżej 0°C."
        };
      }

      // Sprawdzamy, czy klucz nie został już zabrany.
      if (stan.klucz) {
        return {
          stan,
          komunikat: "Masz już klucz."
        };
      }

      // Zapisujemy, że gracz zdobył klucz.
      stan.klucz = true;

      return zakonczUdanaTure(
        stan,
        "Lód się roztopił. Wyjmujesz klucz!"
      );

    // AKCJA: WYJŚCIE Z GRY
    case "wyjdz":

      // Akcja wyjścia działa tylko w pokoju numer 5.
      if (stan.pokoj !== 5) {
        return {
          stan,
          komunikat: "Nie jesteś przy wyjściu."
        };
      }

      // Do wyjścia potrzebna jest karta.
      if (!stan.karta) {
        return {
          stan,
          komunikat: "Potrzebujesz karty dostępu."
        };
      }

      // Drzwi wymagają działającego zasilania.
      if (!stan.zasilanie) {
        return {
          stan,
          komunikat: "Nie działa zasilanie. Najpierw napraw serwerownię."
        };
      }

      // Do otwarcia drzwi potrzebny jest również klucz.
      if (!stan.klucz) {
        return {
          stan,
          komunikat: "Potrzebujesz klucza z chłodni."
        };
      }

      // Wszystkie warunki zostały spełnione.
      // Ustawiamy flagę zwycięstwa.
      stan.wygrana = true;

      // Ustawiamy flagę końca gry.
      stan.koniec = true;

      // Kończymy turę i zwracamy komunikat zwycięstwa.
      return zakonczUdanaTure(
        stan,
        "Używasz klucza, otwierasz drzwi i wygrywasz!"
      );

    // Jeśli akcja nie pasuje do żadnego case,
    // zwracamy komunikat o nieznanej akcji.
    default:
      return {
        stan,
        komunikat: "Nieznana akcja."
      };
  }
}

// Funkcja kończy poprawnie wykonaną turę.
// Odejmowanie energii odbywa się tylko wtedy,
// gdy ruch lub akcja były udane.
function zakonczUdanaTure(stan, komunikat) {

  // Każda udana tura kosztuje 1 punkt energii.
  stan.energia -= 1;

  // Jeśli gracz wygrał, zwracamy komunikat zwycięstwa.
  // Sprawdzamy wygraną przed sprawdzeniem energii,
  // dlatego można wygrać na ostatnim punkcie energii.
  if (stan.wygrana) {
    return {
      stan,
      komunikat: komunikat + " WYGRANA! Drzwi są otwarte."
    };
  }

  // Jeśli energia spadła do 0 lub mniej,
  // gracz przegrywa.
  if (stan.energia <= 0) {

    // Nie pozwalamy, aby energia miała wartość ujemną.
    stan.energia = 0;

    // Zaznaczamy, że gra została zakończona.
    stan.koniec = true;

    return {
      stan,
      komunikat: komunikat + " PRZEGRANA! Zabrakło energii."
    };
  }

  // Jeśli gracz nie wygrał i ma jeszcze energię,
  // zwracamy normalny komunikat.
  return {
    stan,
    komunikat: komunikat +
      " Pozostała energia: " + stan.energia + "."
  };
}

// Funkcja zamienia stan gry na tekst JSON.
// JSON.stringify() zamienia obiekt JavaScript na tekst.
// null oznacza brak dodatkowego filtra.
// 2 oznacza dwa odstępy wcięcia, aby zapis był czytelny.
function eksportujStan(stan) {
  return JSON.stringify({
    wersja: WERSJA_ZAPISU, // Zapisujemy numer wersji.
    stan: stan              // Zapisujemy aktualny stan gry.
  }, null, 2);
}

// Funkcja sprawdza, czy tekst JSON jest poprawnym zapisem gry.
// Nie przyjmuje bezpośrednio obiektu — oczekuje tekstu.
function walidujZapis(tekst) {
  let dane;

  // Próbujemy zamienić tekst JSON na obiekt JavaScript.
  try {
    dane = JSON.parse(tekst);

  // Jeśli tekst nie jest poprawnym JSON-em,
  // JSON.parse() zgłosi błąd i trafimy tutaj.
  } catch (e) {
    return {
      ok: false,
      komunikat: "Błąd: tekst nie jest poprawnym JSON-em."
    };
  }

  // Sprawdzamy, czy wynik parsowania jest obiektem.
  // Tablica również jest obiektem w JavaScript,
  // dlatego dodatkowo sprawdzamy Array.isArray().
  if (!dane || typeof dane !== "object" || Array.isArray(dane)) {
    return {
      ok: false,
      komunikat: "Błąd: zapis musi być obiektem JSON."
    };
  }

  // Zapis musi pochodzić z obsługiwanej wersji gry.
  if (dane.wersja !== WERSJA_ZAPISU) {
    return {
      ok: false,
      komunikat: "Błąd: nieobsługiwana wersja zapisu. Wymagana wersja 2."
    };
  }

  // Pobieramy obiekt zawierający właściwy stan gry.
  const s = dane.stan;

  // Sprawdzamy, czy stan istnieje i jest obiektem.
  if (!s || typeof s !== "object" || Array.isArray(s)) {
    return {
      ok: false,
      komunikat: "Błąd: brak obiektu stan."
    };
  }

  // Lista pól, które muszą znajdować się w stanie gry.
  const wymagane = [
    "pokoj",
    "energia",
    "karta",
    "bezpiecznik",
    "zasilanie",
    "temperatura",
    "klucz",
    "koniec",
    "wygrana"
  ];

  // Object.keys(s) zwraca listę nazw właściwości obiektu.
  // Sprawdzamy, czy liczba pól jest prawidłowa.
  // every() sprawdza, czy każde wymagane pole istnieje.
  // hasOwnProperty() sprawdza własną właściwość obiektu.
  if (
    Object.keys(s).length !== wymagane.length ||
    !wymagane.every(k =>
      Object.prototype.hasOwnProperty.call(s, k)
    )
  ) {
    return {
      ok: false,
      komunikat: "Błąd: stan ma brakujące lub nieznane pola."
    };
  }

  // Numer pokoju musi być liczbą całkowitą.
  // Musi mieścić się w zakresie istniejących pomieszczeń.
  if (
    !Number.isInteger(s.pokoj) ||
    s.pokoj < 1 ||
    s.pokoj > POMIESZCZENIA.length
  ) {
    return {
      ok: false,
      komunikat: "Błąd: pokoj musi być liczbą całkowitą od 1 do 5."
    };
  }

  // Energia musi być liczbą całkowitą.
  // Nie może być ujemna ani większa od limitu.
  if (
    !Number.isInteger(s.energia) ||
    s.energia < 0 ||
    s.energia > MAKS_ENERGIA
  ) {
    return {
      ok: false,
      komunikat: "Błąd: energia musi być liczbą całkowitą od 0 do 12."
    };
  }

  // Lista pól, które muszą mieć wartość true albo false.
  for (const pole of [
    "karta",
    "bezpiecznik",
    "zasilanie",
    "klucz",
    "koniec",
    "wygrana"
  ]) {

    // typeof sprawdza typ wartości.
    // Jeśli pole nie jest booleanem, zapis jest błędny.
    if (typeof s[pole] !== "boolean") {
      return {
        ok: false,
        komunikat: "Błąd: pole " + pole +
          " musi mieć wartość true albo false."
      };
    }
  }

  // Temperatura musi być liczbą całkowitą
  // z zakresu od -5 do 1.
  if (
    !Number.isInteger(s.temperatura) ||
    s.temperatura < -5 ||
    s.temperatura > 1
  ) {
    return {
      ok: false,
      komunikat: "Błąd: temperatura musi być liczbą całkowitą od -5 do 1."
    };
  }

  // Jeśli gracz ma klucz, temperatura musi być
  // większa niż 0°C.
  if (s.klucz && s.temperatura <= 0) {
    return {
      ok: false,
      komunikat: "Błąd: klucz można zdobyć tylko powyżej 0°C."
    };
  }

  // Jeśli zapis mówi, że gracz wygrał,
  // sprawdzamy, czy wszystkie warunki zwycięstwa są spełnione.
  if (
    s.wygrana &&
    (
      !s.koniec ||       // Gra musi być zakończona.
      s.pokoj !== 5 ||   // Gracz musi znajdować się przy wyjściu.
      !s.karta ||        // Musi mieć kartę.
      !s.zasilanie ||    // Zasilanie musi działać.
      !s.klucz           // Musi mieć klucz.
    )
  ) {
    return {
      ok: false,
      komunikat: "Błąd: zależności stanu wygranej są nieprawidłowe."
    };
  }

  // Wygrana przy 0 energii jest dozwolona,
  // ponieważ ostatnia akcja może zakończyć się zwycięstwem.
  if (s.wygrana && s.energia === 0) {
    // Nie trzeba nic robić — taki zapis jest poprawny.

  // Jeśli gra jest zakończona, ale gracz nie wygrał,
  // musi mieć dokładnie 0 energii.
  } else if (s.koniec && !s.wygrana && s.energia !== 0) {
    return {
      ok: false,
      komunikat: "Błąd: przegrana musi mieć 0 energii."
    };
  }

  // Jeśli gra nadal trwa, energia nie może wynosić 0.
  if (!s.koniec && s.energia === 0) {
    return {
      ok: false,
      komunikat: "Błąd: przy 0 energii gra musi być zakończona."
    };
  }

  // Jeśli zasilanie działa, bezpiecznik został zamontowany.
  // Nie powinien więc nadal znajdować się w ekwipunku.
  if (s.zasilanie && s.bezpiecznik) {
    return {
      ok: false,
      komunikat: "Błąd: po naprawie bezpiecznik nie powinien być w ekwipunku."
    };
  }

  // Jeśli wszystkie kontrole zakończyły się pomyślnie,
  // zwracamy ok: true oraz poprawny stan.
  //
  // Tworzymy nowy obiekt stanu zawierający wyłącznie
  // sprawdzone pola. Nie zwracamy bezpośrednio obiektu s.
  return {
    ok: true,
    stan: {
      pokoj: s.pokoj,
      energia: s.energia,
      karta: s.karta,
      bezpiecznik: s.bezpiecznik,
      zasilanie: s.zasilanie,
      temperatura: s.temperatura,
      klucz: s.klucz,
      koniec: s.koniec,
      wygrana: s.wygrana
    },
    komunikat: "Zapis jest poprawny."
  };
}
