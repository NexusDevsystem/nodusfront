import React from 'react';

interface Props {
  text: string;
  letterClass?: string;
}

export function SplitText({ text, letterClass = "" }: Props) {
  return (
    <>
      {text.split(' ').map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {word.split('').map((char, charIdx) => (
            <span 
              key={charIdx} 
              className={`inline-block ${letterClass}`} 
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
            >
              {char}
            </span>
          ))}
          {/* Add a space after each word except the last one */}
          {wordIdx < text.split(' ').length - 1 && (
            <span className="inline-block" style={{ whiteSpace: 'pre' }}> </span>
          )}
        </span>
      ))}
    </>
  );
}
