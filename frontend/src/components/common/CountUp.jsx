import { useState, useEffect, useRef } from 'react';

// Easing function for smooth animation
const easeOutQuad = (t) => t * (2 - t);

const CountUp = ({ end, duration = 2000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          startAnimation();
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const startAnimation = () => {
    let startTimestamp = null;
    // Extract numeric part if 'end' is a string with non-numeric chars (though ideally 'end' should be number or straightforward string)
    // For this simple version, we assume 'end' is a number or a string largely parseable as float.
    // However, the user props use "500+" etc. So we might need to parse the number out or accept 'end' as number and 'suffix' as string.
    
    // Changing approach slightly: We will assume 'end' is passed as a number (e.g. 500) and suffix (e.g. "+") is separate, 
    // OR we act smart and parse it. Let's rely on props strictly for cleaner code as per React patterns. 
    // BUT looking at the user's existing data: { value: '500+', label: 'Franchise Partners' }
    // We should probably parse the number from the string if possible, or expect the user to pass raw numbers.
    // Let's parse it to be safe for the existing data structure.
    
    const numericEnd = parseFloat(String(end).replace(/[^0-9.]/g, ''));
    if (isNaN(numericEnd)) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutQuad(progress);
      
      setCount(Math.floor(easedProgress * numericEnd));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(numericEnd);
      }
    };

    window.requestAnimationFrame(step);
  };

  // If the original value had non-numeric characters (like '500+'), and we parsed '500', 
  // we want to append the '+' back if it wasn't passed as suffix.
  // Actually, to keep it simple and robust for the existing map loop:
  // We'll let the user existing loop pass the full string, and we'll try to preserve the non-numeric parts if we can?
  // No, that's complex. Let's stick to: we animate the number, and we need the generic string structure.
  // Let's modify the usage in HomePage to pass number and suffix/prefix separately if we want clean component,
  // OR we just use the dirty parse method here and append a hardcoded suffix if detected?
  // Let's just animate the number and render the full string if we can't parse? 
  // Better: The component should take `end` as number and `suffix`.
  // I will update HomePage data structure or the mapping logic to pass appropriate props.
  // For now, let's just make this component accept `end` as a number.

  return (
    <span ref={countRef}>
      {prefix}{count}{suffix}
    </span>
  );
};

export default CountUp;
