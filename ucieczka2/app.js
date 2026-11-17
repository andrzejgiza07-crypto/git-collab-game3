
// Aplikacja: konsola, komunikaty i obiekt publicznych komend.
// engine.js musi być załadowany wcześniej.

let stanGry = nowyStan();

function pokazWynik(wynik) {
  stanGry = wynik.stan;
  console.log(wynik.komunikat);
}

function pokazPomoc() {
  console.log("=== UCIECZKA Z SERWEROWNI ===");
  console.log("gra.start() - nowa gra");
  console.log("gra.status() - stan i ekwipunek");
  console.log("gra.mapa() - mapa");
  console.log("gra.rozejrzyj() - opis pokoju");
  console.log('gra.idz("prawo") lub gra.idz("lewo") - ruch');
  console.log('gra.akcja("karta") - zabierz kartę');
  console.log('gra.akcja("bezpiecznik") - zabierz bezpiecznik');
  console.log('gra.akcja("napraw") - napraw zasilanie');
  console.log('gra.akcja("ogrzewanie") - podnieś temperaturę');
  console.log('gra.akcja("klucz") - zabierz klucz z lodu');
  console.log('gra.akcja("wyjdz") - otwórz drzwi');
  console.log("gra.eksportuj() - eksportuje zapis JSON");
  console.log("gra.importuj(tekst) - importuje zapis JSON");
  console.log("Poprawny ruch i udana akcja kosztują 1 energię.");
}

const gra = {
  start() {
    stanGry = nowyStan();

    console.log("UCIECZKA Z SERWEROWNI.");
    console.log("Masz " + MAKS_ENERGIA + " jednostek energii.");

    pokazPomoc();
    this.rozejrzyj();

    return { ...stanGry };
  },

  pomoc: pokazPomoc,

  status() {
    console.log("Pokój: " + nazwaPokoju(stanGry.pokoj));
    console.log("Energia: " + stanGry.energia);
    console.log("Karta: " + (stanGry.karta ? "tak" : "nie"));
    console.log("Bezpiecznik: " + (stanGry.bezpiecznik ? "tak" : "nie"));
    console.log("Zasilanie: " + (stanGry.zasilanie ? "działa" : "nie działa"));
    console.log("Temperatura chłodni: " + stanGry.temperatura + "°C");
    console.log("Klucz: " + (stanGry.klucz ? "tak" : "nie"));

    console.log(
      "Stan gry: " +
      (stanGry.wygrana
        ? "wygrana"
        : stanGry.koniec
        ? "przegrana"
        : "gra trwa")
    );

    return { ...stanGry };
  },

  mapa() {
    console.log("=== MAPA ===");

    for (const pokoj of POMIESZCZENIA) {
      console.log(
        (pokoj.id === stanGry.pokoj ? "➡ " : "  ") +
        pokoj.id + ". " + pokoj.nazwa
      );
    }
  },

  rozejrzyj() {
    console.log(opiszPokoj(stanGry));
  },

  idz(kierunek) {
    const wynik = wykonajRegule(stanGry, {
      typ: "ruch",
      kierunek
    });

    pokazWynik(wynik);

    return { ...stanGry };
  },

  akcja(co) {
    const wynik = wykonajRegule(stanGry, {
      typ: "akcja",
      co
    });

    pokazWynik(wynik);

    return { ...stanGry };
  },

  reset() {
    const wynik = wykonajRegule(stanGry, {
      typ: "reset"
    });

    pokazWynik(wynik);

    return { ...stanGry };
  },

  eksportuj() {
    const tekst = eksportujStan(stanGry);

    console.log("Skopiuj poniższy tekst do pliku, np. zapis.json:");
    console.log(tekst);

    return tekst;
  },

  importuj(tekst) {
    if (typeof tekst !== "string" || tekst.trim() === "") {
      console.log("Import anulowany: nie podano tekstu.");
      return false;
    }

    const wynik = walidujZapis(tekst);

    if (!wynik.ok) {
      console.log(wynik.komunikat);
      return false;
    }

    // Podmiana następuje dopiero po pełnej walidacji.
    stanGry = wynik.stan;

    console.log(
      "Wczytano zapis. Pokój: " +
      nazwaPokoju(stanGry.pokoj) +
      ", energia: " +
      stanGry.energia +
      "."
    );

    return true;
  }
};

console.log("Gra gotowa. Wpisz gra.start(), aby rozpocząć.");
