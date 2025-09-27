export function setupFlowingLinesAnimation(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;

        if (entry.isIntersecting) {
          element.classList.add("animate");

          setTimeout(() => {
            element.classList.remove("animate");
          }, 6000);
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  document.querySelectorAll(".js-flowingLines").forEach((element) => {
    observer.observe(element);
  });
}
