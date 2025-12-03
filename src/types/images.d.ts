declare module '*.JPG' {
  import type { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

declare module '*.JPEG' {
  import type { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

declare module '*.PNG' {
  import type { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

// Also allow lowercase just in case
declare module '*.jpg' {
  import type { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}
declare module '*.jpeg' {
  import type { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}
declare module '*.png' {
  import type { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}
