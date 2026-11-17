
// Silnik gry: dane, stan i czyste reguły.
// Bez console.log i bez zmiany wejściowego stanu.

const WERSJA_ZAPISU = 2;
const MAKS_ENERGIA = 12;

const POMIESZCZENIA = [
  { id: 1, nazwa: "Recepcja", opis: "Na biurku leży karta dostępu." },
  { id: 2, nazwa: "Magazyn", opis: "Na półce leży bezpiecznik." },
  { id: 3, nazwa: "Serwerownia", opis: "Tutaj możesz naprawić zasilanie." },
  { id: 4, nazwa: "Chłodnia", opis: "W lodzie znajduje się klucz. Temperatura wynosi -5°C." },
  { id: 5, nazwa: "Wyjście", opis: "Tutaj znajdują się drzwi wyjściowe." }
];

function nowyStan() {
  return {
    pokoj: 1,
    energia: MAKS_ENERGIA,
    karta: false,
    bezpiecznik: false,
    zasilanie: false,
    temperatura: -5,
    klucz: false,
    koniec: false,
    wygrana: false
  };
}

function kopiujStan(stan) {
  return { ...stan };
}

function nazwaPokoju(numer) {
  const pokoj = POMIESZCZENIA.find(p => p.id === numer);
  return pokoj ? pokoj.nazwa : "Nieznane pomieszczenie";
}

function opiszPokoj(stan) {
  switch (stan.pokoj) {
    case 1:
      return stan.karta
        ? "Karta została już zabrana."
        : "Na biurku leży karta dostępu.";

    case 2:
      return stan.zasilanie
        ? "Bezpiecznik jest zamontowany, a zasilanie działa."
        : stan.bezpiecznik
        ? "Masz bezpiecznik w kieszeni."
        : "Na półce leży bezpiecznik.";

    case 3:
      return stan.zasilanie
        ? "Zasilanie działa."
        : stan.bezpiecznik
        ? "Masz bezpiecznik. Możesz naprawić zasilanie."
        : "Brak zasilania. Potrzebujesz bezpiecznika.";

    case 4:
      if (stan.klucz) {
        return "Zabrałeś już klucz z chłodni. Temperatura: " +
          stan.temperatura + "°C.";
      }

      if (stan.temperatura > 0) {
        return "Lód się roztopił! Możesz zabrać klucz. Temperatura: " +
          stan.temperatura + "°C.";
      }

      return "W lodzie znajduje się klucz. Jest za zimno, aby go wyjąć. Temperatura: " +
        stan.temperatura + "°C.";

    case 5:
      return stan.karta && stan.zasilanie && stan.klucz
        ? "Masz kartę, działające zasilanie i klucz. Możesz otworzyć drzwi."
        : "Wyjście jest zamknięte. Potrzebujesz karty, działającego zasilania i klucza.";

    default:
      return "Nieznane pomieszczenie.";
  }
}

// Główna funkcja obsługująca reguły gry.
function wykonajRegule(stanWejsciowy, komenda) {
  const stan = kopiujStan(stanWejsciowy);

  if (!komenda || typeof komenda.typ !== "string") {
    return { stan, komunikat: "Nieprawidłowa komenda." };
  }

  if (komenda.typ === "reset") {
    const nowy = nowyStan();
    return {
      stan: nowy,
      komunikat: "Gra rozpoczęta od nowa. " + opiszPokoj(nowy)
    };
  }

  if (stan.koniec) {
    return {
      stan,
      komunikat: "Gra jest zakończona. Możesz użyć resetu lub eksportu."
    };
  }

  // RUCH
  if (komenda.typ === "ruch") {
    let nastepny = stan.pokoj;

    if (komenda.kierunek === "prawo") {
      nastepny += 1;
    } else if (komenda.kierunek === "lewo") {
      nastepny -= 1;
    } else {
      return {
        stan,
        komunikat: 'Nieznany kierunek. Użyj "prawo" albo "lewo".'
      };
    }

    if (nastepny < 1 || nastepny > POMIESZCZENIA.length) {
      return {
        stan,
        komunikat: "Nie możesz iść w tym kierunku. Na drodze jest ściana."
      };
    }

    stan.pokoj = nastepny;

    return zakonczUdanaTure(stan, opiszPokoj(stan));
  }

  if (komenda.typ !== "akcja") {
    return { stan, komunikat: "Nieznany typ komendy." };
  }

  // AKCJE
  switch (komenda.co) {
    case "karta":
      if (stan.pokoj !== 1 || stan.karta) {
        return {
          stan,
          komunikat: "Tutaj nie ma karty do zabrania."
        };
      }

      stan.karta = true;

      return zakonczUdanaTure(
        stan,
        "Zabierasz kartę dostępu."
      );

    case "bezpiecznik":
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

      stan.bezpiecznik = true;

      return zakonczUdanaTure(
        stan,
        "Zabierasz bezpiecznik."
      );

    case "napraw":
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

      stan.bezpiecznik = false;
      stan.zasilanie = true;

      return zakonczUdanaTure(
        stan,
        "Montujesz bezpiecznik i naprawiasz zasilanie."
      );

    case "ogrzewanie":
      if (stan.pokoj !== 4) {
        return {
          stan,
          komunikat: "Nie jesteś w chłodni."
        };
      }

      if (stan.temperatura > 0) {
        return {
          stan,
          komunikat: "W chłodni jest już wystarczająco ciepło."
        };
      }

      stan.temperatura += 3;

      return zakonczUdanaTure(
        stan,
        "Podnosisz temperaturę. Teraz wynosi " +
          stan.temperatura + "°C."
      );

    case "klucz":
      if (stan.pokoj !== 4) {
        return {
          stan,
          komunikat: "Musisz być w chłodni, aby zabrać klucz."
        };
      }

      if (stan.temperatura <= 0) {
        return {
          stan,
          komunikat: "Jest za zimno! Podnieś temperaturę powyżej 0°C."
        };
      }

      if (stan.klucz) {
        return {
          stan,
          komunikat: "Masz już klucz."
        };
      }

      stan.klucz = true;

      return zakonczUdanaTure(
        stan,
        "Lód się roztopił. Wyjmujesz klucz!"
      );

    case "wyjdz":
      if (stan.pokoj !== 5) {
        return {
          stan,
          komunikat: "Nie jesteś przy wyjściu."
        };
      }

      if (!stan.karta) {
        return {
          stan,
          komunikat: "Potrzebujesz karty dostępu."
        };
      }

      if (!stan.zasilanie) {
        return {
          stan,
          komunikat: "Nie działa zasilanie. Najpierw napraw serwerownię."
        };
      }

      if (!stan.klucz) {
        return {
          stan,
          komunikat: "Potrzebujesz klucza z chłodni."
        };
      }

      stan.wygrana = true;
      stan.koniec = true;

      return zakonczUdanaTure(
        stan,
        "Używasz klucza, otwierasz drzwi i wygrywasz!"
      );

    default:
      return {
        stan,
        komunikat: "Nieznana akcja."
      };
  }
}

// Zakończenie udanej tury i odjęcie energii.
function zakonczUdanaTure(stan, komunikat) {
  stan.energia -= 1;

  if (stan.wygrana) {
    return {
      stan,
      komunikat: komunikat + " WYGRANA! Drzwi są otwarte."
    };
  }

  if (stan.energia <= 0) {
    stan.energia = 0;
    stan.koniec = true;

    return {
      stan,
      komunikat: komunikat + " PRZEGRANA! Zabrakło energii."
    };
  }

  return {
    stan,
    komunikat: komunikat +
      " Pozostała energia: " + stan.energia + "."
  };
}

// Eksport stanu do tekstu JSON.
function eksportujStan(stan) {
  return JSON.stringify({
    wersja: WERSJA_ZAPISU,
    stan: stan
  }, null, 2);
}

// Walidacja zapisu JSON.
function walidujZapis(tekst) {
  let dane;

  try {
    dane = JSON.parse(tekst);
  } catch (e) {
    return {
      ok: false,
      komunikat: "Błąd: tekst nie jest poprawnym JSON-em."
    };
  }

  if (!dane || typeof dane !== "object" || Array.isArray(dane)) {
    return {
      ok: false,
      komunikat: "Błąd: zapis musi być obiektem JSON."
    };
  }

  if (dane.wersja !== WERSJA_ZAPISU) {
    return {
      ok: false,
      komunikat: "Błąd: nieobsługiwana wersja zapisu. Wymagana wersja 2."
    };
  }

  const s = dane.stan;

  if (!s || typeof s !== "object" || Array.isArray(s)) {
    return {
      ok: false,
      komunikat: "Błąd: brak obiektu stan."
    };
  }

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

  for (const pole of [
    "karta",
    "bezpiecznik",
    "zasilanie",
    "klucz",
    "koniec",
    "wygrana"
  ]) {
    if (typeof s[pole] !== "boolean") {
      return {
        ok: false,
        komunikat: "Błąd: pole " + pole +
          " musi mieć wartość true albo false."
      };
    }
  }

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

  if (s.klucz && s.temperatura <= 0) {
    return {
      ok: false,
      komunikat: "Błąd: klucz można zdobyć tylko powyżej 0°C."
    };
  }

  if (
    s.wygrana &&
    (
      !s.koniec ||
      s.pokoj !== 5 ||
      !s.karta ||
      !s.zasilanie ||
      !s.klucz
    )
  ) {
    return {
      ok: false,
      komunikat: "Błąd: zależności stanu wygranej są nieprawidłowe."
    };
  }

  if (s.wygrana && s.energia === 0) {
    // Wygrana na ostatniej energii jest dozwolona.
  } else if (s.koniec && !s.wygrana && s.energia !== 0) {
    return {
      ok: false,
      komunikat: "Błąd: przegrana musi mieć 0 energii."
    };
  }

  if (!s.koniec && s.energia === 0) {
    return {
      ok: false,
      komunikat: "Błąd: przy 0 energii gra musi być zakończona."
    };
  }

  if (s.zasilanie && s.bezpiecznik) {
    return {
      ok: false,
      komunikat: "Błąd: po naprawie bezpiecznik nie powinien być w ekwipunku."
    };
  }

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
