import { useEffect, useState } from "react";
import AuthForm from "./AuthForm";

import lostDog from "../../../img/lost-dog.jpg";
import burek from "../../../img/burek.jpg";
import foundCat from "../../../img/found-cat.jpg";
import gatito from "../../../img/gatito.jpg";

// PROFILE + POWIĄZANE KOMENTARZE
const profilesData = [
  {
    id: "pedzel",
    img: lostDog,
    name: "Pędzel",
    status: "Zaginiony",
    type: "lost",
    description: "Zaginął w okolicach parku Cytadela w Poznaniu.",
    comments: [
      {
        text: "Udostępniłam ogłoszenie, mam nadzieję, że szybko wróci do domu.",
        author: "Marta",
      },
      {
        text: "Widziałem podobnego psa przy ul. Leśnej, proszę sprawdzić.",
        author: "Kamil",
      },
      {
        text: "Popytam sąsiadów na działkach, często tam biegają psy.",
        author: "Basia",
      },
      {
        text: "Jeśli trzeba pomocy w rozwieszeniu plakatów, chętnie pomogę.",
        author: "Ola",
      },
    ],
  },
  {
    id: "burek",
    img: burek,
    name: "Burek",
    status: "Zaginiony",
    type: "lost",
    description: "Ostatni raz widziany w pobliżu osiedlowego sklepu.",
    comments: [
      {
        text: "Udostępniłem w grupie osiedlowej – może ktoś go rozpozna.",
        author: "Tomek",
      },
      {
        text: "Mamy monitoring przy wejściu do parku, mogę sprawdzić nagrania.",
        author: "Paweł",
      },
      {
        text: "Sprawdzę okolice torów, tam często chowają się psy.",
        author: "Robert",
      },
    ],
  },
  {
    id: "nero",
    img: foundCat,
    name: "Nero",
    status: "Odnaleziony",
    type: "found",
    description: "Znaleziony przy głównej ulicy, bez obroży.",
    comments: [
      {
        text: "Dziękuję wszystkim za udostępnienia – tylko dzięki wam Nero się znalazł.",
        author: "Właścicielka",
      },
      {
        text: "Super wiadomość! Niech już zawsze wraca prosto do domu.",
        author: "Karolina",
      },
    ],
  },
  {
    id: "mela",
    img: gatito,
    name: "Mela",
    status: "Zaginiona",
    type: "lost",
    description: "Zniknęła z ogrodu, może chować się w piwnicach.",
    comments: [
      {
        text: "Sprawdziłam piwnice w bloku obok – dam znać, jeśli ją zobaczę.",
        author: "Ania",
      },
      {
        text: "Podrzuciłam ogłoszenie do lokalnego schroniska i na ich profil.",
        author: "Kasia",
      },
      {
        text: "Mogę rano przejść się po okolicy z latarką, koty lubią chować się pod samochodami.",
        author: "Bartek",
      },
    ],
  },
];

const Form = () => {
  // jeden stan trzyma zarówno indeks profilu, jak i komentarza
  const [rotation, setRotation] = useState({ profileIdx: 0, commentIdx: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => {
        const currentProfile = profilesData[prev.profileIdx];
        const commentsCount = currentProfile.comments.length;

        const nextCommentIdx = (prev.commentIdx + 1) % commentsCount;
        let nextProfileIdx = prev.profileIdx;

        // Po przejściu wszystkich komentarzy danego profilu – zmiana profilu
        if (nextCommentIdx === 0) {
          nextProfileIdx = (prev.profileIdx + 1) % profilesData.length;
        }

        return { profileIdx: nextProfileIdx, commentIdx: nextCommentIdx };
      });
    }, 4000); // komentarz zmienia się co 4 sekundy

    return () => clearInterval(interval);
  }, []);

  const currentProfile = profilesData[rotation.profileIdx];
  const currentComment =
    currentProfile.comments[rotation.commentIdx] || currentProfile.comments[0];

  const statusBadgeClass =
    currentProfile.type === "found"
      ? "bg-green-500 text-main"
      : "bg-negative text-main";

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center lg:flex-row">
      <AuthForm />

      <div className="lg:relative hidden lg:block lg:w-1/2">
        <div className="relative w-full h-full">
          {/* Przyciemnione tło*/}
          <div className="absolute inset-0 bg-main opacity-75" />

          {/* Zawartość prawej kolumny */}
          <div className="lg:absolute lg:top-[45%] lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:h-full lg:z-10 lg:flex lg:items-center lg:justify-center">
            <div className="relative text-center flex flex-col items-center gap-4 px-8 max-w-xl">
              <div className="mb-2">
                <h1 className="font-bold text-5xl">
                  Znajdź swojego
                  <br />
                  przyjaciela!
                </h1>
                <p className="mt-3">
                  PetLify: Nadzieja dla zagubionych, pomoc dla szukających
                </p>
              </div>

              {/*fade-in*/}
              <div className="w-full flex justify-center mt-1">
                <div
                  key={currentProfile.id}
                  className="fade-in-up w-full max-w-md bg-black/80 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm shadow-[0_18px_40px_rgba(0,0,0,0.7)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                      <img
                        src={currentProfile.img}
                        alt={`${currentProfile.name} – ${currentProfile.status}`}
                        className="w-full h-full object-cover filter grayscale"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold truncate">
                          {currentProfile.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${statusBadgeClass}`}
                        >
                          {currentProfile.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-accent/90 truncate">
                        {currentProfile.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOMENTARZ „CZATOWY” – powiązany z aktualnym profilem, też z fade-in */}
              <div className="w-full mt-3">
                <div
                  key={`${currentProfile.id}-${rotation.commentIdx}`}
                  className="fade-in-up inline-block bg-[#202020] text-accent text-[11px] leading-snug rounded-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.9)] px-4 py-3 relative -rotate-1 border border-cta/40 backdrop-blur-[2px]"
                >
                  {/* „Taśmy” w kolorze CTA */}
                  <span className="absolute -top-2 left-8 w-10 h-4 bg-cta/80 rounded-sm opacity-90" />
                  <span className="absolute -top-2 right-10 w-8 h-4 bg-cta/70 rounded-sm opacity-85 rotate-3" />

                  <p className="italic">„{currentComment.text}”</p>
                  <p className="mt-1 text-[10px] font-semibold text-neutral-300 not-italic">
                    — {currentComment.author}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
