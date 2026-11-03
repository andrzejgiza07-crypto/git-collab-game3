// Silnik gry: dane, stan i czyste reguły. Bez console.log i bez zmiany wejściowego stanu.
const WERSJA_ZAPISU = 1;
const MAKS_ENERGIA = 10;

const POMIESZCZENIA = [
  { id: 1, nazwa: "Recepcja", opis: "Na biurku leży karta dostępu." },
  { id: 2, nazwa: "Magazyn", opis: "Na półce leży bezpiecznik." },
  { id: 3, nazwa: "Serwerownia", opis: "Tutaj możesz naprawić zasilanie." },
  { id: 4, nazwa: "Wyjście", opis: "Tutaj znajdują się drzwi wyjściowe." }
];

function nowyStan() {
  return {
    pokoj: 1,
    energia: MAKS_ENERGIA,
    karta: false,
    bezpiecznik: false,
    zasilanie: false,
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
      return stan.karta ? "Karta została już zabrana." : "Na biurku leży karta dostępu.";
    case 2:
      return stan.zasilanie ? "Bezpiecznik jest zamontowany, a zasilanie działa."
        : stan.bezpiecznik ? "Masz bezpiecznik w kieszeni."
        : "Na półce leży bezpiecznik.";
    case 3:
      return stan.zasilanie ? "Zasilanie działa."
        : stan.bezpiecznik ? "Masz bezpiecznik. Możesz naprawić zasilanie."
        : "Brak zasilania. Potrzebujesz bezpiecznika.";
    case 4:
      return stan.karta && stan.zasilanie
        ? "Masz kartę i zasilanie działa. Możesz otworzyć drzwi."
        : "Wyjście jest zamknięte. Potrzebujesz karty i działającego zasilania.";
    default:
      return "Nieznane pomieszczenie.";
  }
}

// Funkcja reguł jest czysta: nie zmienia stanu wejściowego i niczego nie wypisuje.
// Komendy: { typ: "ruch", kierunek: "prawo"|"lewo" }, { typ: "akcja", co: ... }, { typ: "reset" }.
function wykonajRegule(stanWejsciowy, komenda) {
  const stan = kopiujStan(stanWejsciowy);

  if (!komenda || typeof komenda.typ !== "string") {
    return { stan, komunikat: "Nieprawidłowa komenda." };
  }

  if (komenda.typ === "reset") {
    return { stan: nowyStan(), komunikat: "Gra rozpoczęta od nowa. " + opiszPokoj(nowyStan()) };
  }

  if (stan.koniec) {
    return { stan, komunikat: "Gra jest zakończona. Możesz użyć resetu lub eksportu." };
  }

  if (komenda.typ === "ruch") {
    let nastepny = stan.pokoj;
    if (komenda.kierunek === "prawo") nastepny += 1;
    else if (komenda.kierunek === "lewo") nastepny -= 1;
    else return { stan, komunikat: 'Nieznany kierunek. Użyj "prawo" albo "lewo".' };

    if (nastepny < 1 || nastepny > POMIESZCZENIA.length) {
      return { stan, komunikat: "Nie możesz iść w tym kierunku. Na drodze jest ściana." };
    }
    stan.pokoj = nastepny;
    return zakonczUdanaTure(stan, opiszPokoj(stan));
  }

  if (komenda.typ !== "akcja") {
    return { stan, komunikat: "Nieznany typ komendy." };
  }

  switch (komenda.co) {
    case "karta":
      if (stan.pokoj !== 1 || stan.karta) return { stan, komunikat: "Tutaj nie ma karty do zabrania." };
      stan.karta = true;
      return zakonczUdanaTure(stan, "Zabierasz kartę dostępu.");
    case "bezpiecznik":
      if (stan.pokoj !== 2 || stan.bezpiecznik || stan.zasilanie) {
        return { stan, komunikat: "Nie możesz zabrać bezpiecznika." };
      }
      stan.bezpiecznik = true;
      return zakonczUdanaTure(stan, "Zabierasz bezpiecznik.");
    case "napraw":
      if (stan.pokoj !== 3 || !stan.bezpiecznik || stan.zasilanie) {
        return { stan, komunikat: "Nie możesz naprawić zasilania. Potrzebujesz bezpiecznika w serwerowni." };
      }
      stan.bezpiecznik = false;
      stan.zasilanie = true;
      return zakonczUdanaTure(stan, "Montujesz bezpiecznik i naprawiasz zasilanie.");
    case "wyjdz":
      if (stan.pokoj !== 4 || !stan.karta || !stan.zasilanie) {
        return { stan, komunikat: "Nie możesz otworzyć drzwi. Potrzebujesz karty i działającego zasilania." };
      }
      stan.wygrana = true;
      stan.koniec = true;
      return zakonczUdanaTure(stan, "Otwierasz drzwi i wygrywasz!");
    default:
      return { stan, komunikat: "Nieznana akcja." };
  }
}

function zakonczUdanaTure(stan, komunikat) {
  stan.energia -= 1;
  if (stan.wygrana) {
    return { stan, komunikat: komunikat + " WYGRANA! Drzwi są otwarte." };
  }
  if (stan.energia <= 0) {
    stan.energia = 0;
    stan.koniec = true;
    return { stan, komunikat: komunikat + " PRZEGRANA! Zabrakło energii." };
  }
  return { stan, komunikat: komunikat + " Pozostała energia: " + stan.energia + "." };
}

function eksportujStan(stan) {
  return JSON.stringify({ wersja: WERSJA_ZAPISU, stan: stan }, null, 2);
}

// Walidacja zwraca nowy obiekt dopiero po sprawdzeniu wszystkich pól i zależności.
function walidujZapis(tekst) {
  let dane;
  try {
    dane = JSON.parse(tekst);
  } catch (e) {
    return { ok: false, komunikat: "Błąd: tekst nie jest poprawnym JSON-em." };
  }

  if (!dane || typeof dane !== "object" || Array.isArray(dane)) {
    return { ok: false, komunikat: "Błąd: zapis musi być obiektem JSON." };
  }
  if (dane.wersja !== WERSJA_ZAPISU) {
    return { ok: false, komunikat: "Błąd: nieobsługiwana wersja zapisu." };
  }
  const s = dane.stan;
  if (!s || typeof s !== "object" || Array.isArray(s)) {
    return { ok: false, komunikat: "Błąd: brak obiektu stan." };
  }

  const wymagane = ["pokoj", "energia", "karta", "bezpiecznik", "zasilanie", "koniec", "wygrana"];
  if (Object.keys(s).length !== wymagane.length || !wymagane.every(k => Object.prototype.hasOwnProperty.call(s, k))) {
    return { ok: false, komunikat: "Błąd: stan ma brakujące lub nieznane pola." };
  }
  if (!Number.isInteger(s.pokoj) || s.pokoj < 1 || s.pokoj > 4) {
    return { ok: false, komunikat: "Błąd: pokoj musi być liczbą całkowitą od 1 do 4." };
  }
  if (!Number.isInteger(s.energia) || s.energia < 0 || s.energia > MAKS_ENERGIA) {
    return { ok: false, komunikat: "Błąd: energia musi być liczbą całkowitą od 0 do 10." };
  }
  for (const pole of ["karta", "bezpiecznik", "zasilanie", "koniec", "wygrana"]) {
    if (typeof s[pole] !== "boolean") {
      return { ok: false, komunikat: "Błąd: pole " + pole + " musi mieć wartość true albo false." };
    }
  }
  if (s.wygrana && (!s.koniec || s.energia < 0 || s.pokoj !== 4 || !s.karta || !s.zasilanie)) {
    return { ok: false, komunikat: "Błąd: zależności stanu wygranej są nieprawidłowe." };
  }
  if (s.wygrana && s.energia === 0) {
    // Wygrana na ostatniej energii jest dozwolona.
  } else if (s.koniec && !s.wygrana && s.energia !== 0) {
    return { ok: false, komunikat: "Błąd: przegrana musi mieć 0 energii." };
  }
  if (!s.koniec && s.energia === 0) {
    return { ok: false, komunikat: "Błąd: przy 0 energii gra musi być zakończona." };
  }
  if (s.zasilanie && s.bezpiecznik) {
    return { ok: false, komunikat: "Błąd: po naprawie bezpiecznik nie powinien być w ekwipunku." };
  }
  if (s.wygrana && !s.koniec) {
    return { ok: false, komunikat: "Błąd: wygrana oznacza zakończoną grę." };
  }

  return {
    ok: true,
    stan: {
      pokoj: s.pokoj, energia: s.energia, karta: s.karta,
      bezpiecznik: s.bezpiecznik, zasilanie: s.zasilanie,
      koniec: s.koniec, wygrana: s.wygrana
    },
    komunikat: "Zapis jest poprawny."
  };
}
