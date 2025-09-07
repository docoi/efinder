import Head from 'next/head';

export default function DynamicLandingPage({ slug }) {
  return (
    <>
      <Head>
        <title>{`${slug} | Insta Email Scout`}</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-bold text-purple-700">Landing page for: {slug}</h1>
      </div>
    </>
  );
}

// Dynamic route support
export async function getServerSideProps(context) {
  const { slug } = context.params;
  return { props: { slug } };
}
