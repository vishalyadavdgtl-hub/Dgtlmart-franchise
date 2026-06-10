import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    show && (
      <button
        onClick={scrollUp}
        className="fixed bottom-2 right-2 z-50 rounded-full bg-black p-3 text-white text-xl shadow-lg transition hover:bg-gray-800"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    )
  );
}
