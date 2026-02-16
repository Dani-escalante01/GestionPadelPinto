function CalendarWidget() {
  return {
    view: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalizamos hoy para comparar

      const year = State.selectedDate.getFullYear();
      const month = State.selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      return m("div", { class: "calendar-widget" }, [
        m("div", { class: "cal-header" }, [
          m("span", `${MONTHS[month]} ${year}`),
          // Botones uno al lado del otro
          m("div", { class: "flex", style: "display: flex; gap: 4px;" }, [
            m(
              "button",
              {
                class: "cal-day",
                onclick: () => Actions.selectDate(new Date(year, month - 1, 1)),
              },
              "‹",
            ),
            m(
              "button",
              {
                class: "cal-day",
                onclick: () => Actions.selectDate(new Date(year, month + 1, 1)),
              },
              "›",
            ),
          ]),
        ]),
        m("div", { class: "cal-grid" }, [
          ["L", "M", "X", "J", "V", "S", "D"].map((d) =>
            m("span", { class: "cal-day-name" }, d),
          ),
          days.map((day) => {
            const dateIter = new Date(year, month, day);
            const isSelected =
              day === State.selectedDate.getDate() &&
              month === State.selectedDate.getMonth();
            const isToday = dateIter.getTime() === today.getTime();
            const isPast = dateIter < today;

            return m(
              "button",
              {
                class: `cal-day ${isSelected ? "selected" : ""}`,
                style: `position: relative; ${isPast ? "opacity: 0.4; cursor: default;" : ""}`,
                onclick: () =>
                  !isPast && Actions.selectDate(new Date(year, month, day)),
                disabled: isPast,
              },
              [
                m("span", day),
                // Punto indicador de día actual
                isToday
                  ? m("div", {
                      style:
                        "position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: " +
                        (isSelected ? "white" : "var(--primary)"),
                    })
                  : null,
              ],
            );
          }),
        ]),
      ]);
    },
  };
}

function TimeSelector() {
  return {
    view: () =>
      m(
        "div",
        { class: "time-grid" },
        HOURS.map((h) =>
          m(
            "button",
            {
              class: `time-btn ${State.selectedTime === h ? "selected" : ""}`,
              onclick: () => (State.selectedTime = h),
            },
            h,
          ),
        ),
      ),
  };
}
