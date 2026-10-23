document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("news-list");
  if (!container) return;

  const tag = container.dataset.tag || null;
  const limit = tag ? Infinity : 3;

  fetch("news.json?v=1")
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load news.json");
      }
      return response.json();
    })
    .then(items => {
      let filtered = items
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (tag) {
        filtered = filtered.filter(item => item.tags && item.tags.includes(tag));
      }

      filtered = filtered.slice(0, limit);

      if (filtered.length === 0) {
        container.innerHTML = `<p class="news-empty">No updates yet — check back soon.</p>`;
        return;
      }

      filtered.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "news-item";

        if (index === 0) div.classList.add("news-item-featured");
        else div.classList.add("news-item-stacked");

        // Optional per-item image controls in news.json:
        //   "focus": which part stays visible when cropped, e.g. "top", "center 30%", "left"
        //   "fit": "contain" to show the whole image instead of filling the box
        const imageClass = item.fit === "contain" ? "news-image news-image-contain" : "news-image";
        const imageStyle = item.focus ? ` style="object-position: ${item.focus}"` : "";

        div.innerHTML = `
          ${item.image ? `<img src="${item.image}" class="${imageClass}"${imageStyle} alt="">` : ""}
          <div class="news-date">${new Date(item.date).toLocaleDateString()}</div>
          <div class="news-title">${item.title}</div>
          <div class="news-text">${item.text}</div>
          ${item.link ? `<a href="${item.link}" class="news-link">Read more →</a>` : ""}
        `;

        container.appendChild(div);
      });
    })
    .catch(error => {
      console.error(error);
      container.innerHTML = "<p>Unable to load news.</p>";
    });
});
