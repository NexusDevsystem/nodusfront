import React from 'react';

interface Props {
  text: string;
  letterClass?: string;
}

export function SplitText({ text, letterClass = "" }: Props) {
  return (
    <>
      {text.split('').map((char, i) => (
        <span 
          key={i} 
          className={`inline-block ${letterClass}`} 
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ))}
    </>
  );
}
