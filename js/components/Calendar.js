import { HomeState, Home, HomeActions, HOURS, MONTHS } from "../views/Home.js";

export const CalendarWidget = {
    view: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const year = HomeState.selectedDate.getFullYear();
      const month = HomeState.selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const isPastMonth = year < currentYear || (year === currentYear && month <= currentMonth);

      const totalCellsUsed = firstDayIndex + daysInMonth;
      const remainingSlots = (7 - (totalCellsUsed % 7)) % 7;
      const nextMonthDays = Array.from({ length: remainingSlots }, (_, i) => i + 1);

      return m("div", { class: "calendar-widget" }, [
        m("div", { class: "cal-header" }, [
          m("span", `${MONTHS[month]} ${year}`),
          m("div", { class: "flex", style: "display: flex; gap: 4px;" }, [
            m("button", {
              class: "cal-day",
              style: isPastMonth ? "opacity: 0.3; cursor: default;" : "",
              onclick: () => !isPastMonth && HomeActions.selectDate(new Date(year, month - 1, 1)),
              disabled: isPastMonth
            }, "‹"),
            m("button", { class: "cal-day", onclick: () => HomeActions.selectDate(new Date(year, month + 1, 1)) }, "›"),
          ]),
        ]),
        m("div", { class: "cal-grid" }, [
          ["L", "M", "X", "J", "V", "S", "D"].map((d) => m("span", { class: "cal-day-name" }, d)),

          Array.from({ length: firstDayIndex }).map(() => m("span")),

          days.map((day) => {
            const dateIter = new Date(year, month, day);
            const isSelected = day === HomeState.selectedDate.getDate() && month === HomeState.selectedDate.getMonth() && year === HomeState.selectedDate.getFullYear();
            const isToday = dateIter.getTime() === today.getTime();
            const isPast = dateIter < today;

            return m("button", {
              class: `cal-day ${isSelected ? "selected" : ""}`,
              style: `position: relative; ${isPast ? "opacity: 0.4; cursor: default;" : ""}`,
              onclick: () => !isPast && HomeActions.selectDate(new Date(year, month, day)),
              disabled: isPast,
            }, [
              m("span", day),
              isToday ? m("div", {
                style: "position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: " + (isSelected ? "white" : "var(--primary)"),
              }) : null,
            ]);
          }),

          nextMonthDays.map((day) => {
            return m("button", {
              class: "cal-day",
              style: "opacity: 0.6", 
              onclick: () => HomeActions.selectDate(new Date(year, month + 1, day))
            }, m("span", day));
          })
        ]),
      ]);
    },
  };

export const TimeSelector = {
    view: () => m("div", { class: "time-grid" },
      HOURS.map((h) => m("button", {
        class: `time-btn ${HomeState.selectedTime === h ? "selected" : ""}`,
        onclick: () => (HomeState.selectedTime = h),
      }, h))
    ),
  };
