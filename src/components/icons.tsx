import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M22 12C22 12 18 18 12 18C6 18 2 12 2 12C2 12 6 6 12 6C18 6 22 12 22 12Z" />
      <path d="m16 8-2.3 2.3" />
      <path d="m8 16 2.3-2.3" />
      <path d="m16 16-2.3-2.3" />
      <path d="m8 8 2.3 2.3" />
    </svg>
  );
}
