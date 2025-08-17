document.addEventListener("DOMContentLoaded", async function () {
  const response = await fetch("src/data/data.json");
  const rawEvents = await response.json();
  const BASE_URL = "/kalender-promo/"
  // split event multi-hari jadi per-hari
  let events = [];
  rawEvents.forEach(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    // jika start < end, split per hari
    if (start < end) {
      events.push(...splitEventByDay(event));
    } else {
      events.push(event);
    }
  });

  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridWeek",
    events: events,
    locale: "id",
    height: 550,
    contentHeight: 300,
    expandRows: true,

    // custom render event
    eventContent: function(arg) {
      let title = arg.event.title;
      let image = arg.event.extendedProps.image;
      let container = document.createElement("div");
      container.className = "flex items-center gap-3";

      // image / placeholder
      if (image) {
        let img = document.createElement("img");
        img.src = BASE_URL + image;
        img.className = "w-12 h-12 object-cover rounded-lg";
        img.onerror = () => {
          img.remove();
          let placeholder = document.createElement("div");
          placeholder.className = "w-12 h-12 flex items-center justify-center bg-gray-700 text-gray-400 rounded-lg text-xs text-center leading-tight px-1";
          placeholder.textContent = "Image 404 :(";
          container.prepend(placeholder);
        };
        container.appendChild(img);
      } else {
        let placeholder = document.createElement("div");
        placeholder.className = "w-12 h-12 flex items-center justify-center bg-gray-700 text-gray-400 rounded-lg text-xs text-center leading-tight px-1";
        placeholder.textContent = "No Image";
        container.appendChild(placeholder);
      }

      // title
      let text = document.createElement("div");
      text.innerHTML = `<span class="font-semibold block break-words whitespace-normal max-w-[100px]">${title}</span>`;
      container.appendChild(text);

      return { domNodes: [container] };
    },

    // klik event
    eventClick: function(info) {
      const event = info.event.extendedProps;

      // isi modal
      document.getElementById("modalTitle").textContent = info.event.title;
      document.getElementById("modalDescription").innerHTML = event.description || "Tidak ada deskripsi.";

      const img = document.getElementById("modalImage");
      img.src = BASE_URL + event.image || "https://placehold.co/600x400?text=No+Image";

      img.onerror = function () {
        this.onerror = null;
        this.src = "https://placehold.co/600x400?text=Sorry,+image+not+found+%3A(";
      };

      // tampilkan modal
      const modal = document.getElementById("promoModal");
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  });

  calendar.render();

  // Tutup modal
  document.getElementById("closeModal").addEventListener("click", function () {
    const modal = document.getElementById("promoModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });
});

function splitEventByDay(event) {
  const events = [];
  let current = new Date(event.start);
  const end = new Date(event.end);

  while (current <= end) {
    events.push({
      title: event.title,
      start: current.toISOString().split("T")[0], // format YYYY-MM-DD
      extendedProps: {
        description: event.description,
        image: event.image
    }
    });
    current.setDate(current.getDate() + 1);
  }

  return events;
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    const modal = document.getElementById("promoModal");
    if (!modal.classList.contains("hidden")) { // kalau modal terbuka
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }
});

Swal.fire({
  title: 'Website Under Maintenance',
  text: 'Mohon kembali nanti.',
  icon: 'info',
  confirmButtonText: 'Oke',
  allowOutsideClick: false,
  allowEscapeKey: false
});
