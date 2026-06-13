// import { HelmetProvider, Helmet } from "react-helmet-async";

// const PageMeta = ({
//   title,
//   description,
// }: {
//   title: string;
//   description: string;
// }) => (
//   <Helmet>
//     <title>{title}</title>
//     <meta name="description" content={description} />
//   </Helmet>
// );

// export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
//   <HelmetProvider>{children}</HelmetProvider>
// );

// export default PageMeta;
// PageMeta.tsx
// PageMeta.tsx
import { useLayoutEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  useLayoutEffect(() => {
    // Force update title directly as fallback
    document.title = title;
  }, [title]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);
export default PageMeta;