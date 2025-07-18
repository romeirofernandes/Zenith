import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

// Gradients for avatars (can be any, not theme-dependent)
const avatarGradients = [
  "bg-gradient-to-br from-pink-400 to-yellow-300",
  "bg-gradient-to-tr from-blue-400 to-green-300",
  "bg-gradient-to-tl from-purple-400 to-pink-300",
  "bg-gradient-to-r from-orange-400 to-red-300",
  "bg-gradient-to-b from-teal-400 to-blue-300",
  "bg-gradient-to-l from-indigo-400 to-purple-300",
];

const reviews = [
  {
    name: "Aarav",
    username: "@aarav",
    body: "Zenith made my job search so much easier. The AI roadmap is a game changer.",
    img: "https://avatar.vercel.sh/aarav",
  },
  {
    name: "Priya",
    username: "@priya",
    body: "I love the wishlist and the project-based learning suggestions. Super helpful!",
    img: "https://avatar.vercel.sh/priya",
  },
  {
    name: "Rahul",
    username: "@rahul",
    body: "The resume parsing was spot on. Saved me hours of editing.",
    img: "https://avatar.vercel.sh/rahul",
  },
  {
    name: "Sneha",
    username: "@sneha",
    body: "The dashboard is clean and the analytics are insightful. Highly recommend Zenith.",
    img: "https://avatar.vercel.sh/sneha",
  },
  {
    name: "Vikram",
    username: "@vikram",
    body: "AI interview practice gave me the confidence to ace my interviews.",
    img: "https://avatar.vercel.sh/vikram",
  },
  {
    name: "Meera",
    username: "@meera",
    body: "The skill map is unique and helped me focus on trending skills.",
    img: "https://avatar.vercel.sh/meera",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({ img, name, username, body, gradientClass }) => (
  <figure
    className={cn(
      "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
      "border-border bg-card hover:bg-primary/5",
      "dark:border-border dark:bg-card dark:hover:bg-primary/10"
    )}
  >
    <div className="flex flex-row items-center gap-2">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          gradientClass
        )}
      >
        <img
          className="rounded-full w-7 h-7 border-2 border-background object-cover"
          width="28"
          height="28"
          alt=""
          src={img}
        />
      </div>
      <div className="flex flex-col">
        <figcaption className="text-sm font-medium text-foreground">
          {name}
        </figcaption>
        <p className="text-xs font-medium text-muted-foreground">{username}</p>
      </div>
    </div>
    <blockquote className="mt-2 text-sm text-foreground">{body}</blockquote>
  </figure>
);

export default function MarqueeDemo() {
  return (
    <section className="mt-24 max-w-5xl mx-auto w-full">
      <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-center mb-8">
        What our users say
      </h2>
      <div className="relative flex flex-col items-center justify-center overflow-hidden py-8">
        <Marquee pauseOnHover className="[--duration:8s] min-w-[700px]">
          {firstRow.map((review, i) => (
            <ReviewCard
              key={review.username}
              {...review}
              gradientClass={avatarGradients[i % avatarGradients.length]}
            />
          ))}
        </Marquee>
        <Marquee
          reverse
          pauseOnHover
          className="[--duration:8s] min-w-[700px] mt-4"
        >
          {secondRow.map((review, i) => (
            <ReviewCard
              key={review.username}
              {...review}
              gradientClass={avatarGradients[(i + 3) % avatarGradients.length]}
            />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
      </div>
    </section>
  );
}
