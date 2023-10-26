import PageHeader from "~/components/PageHeader";
import Game from "./(game)/Game";

export default async function Home() {
  return (
    <main>
      <PageHeader />
      <Game />
    </main>
  );
}
