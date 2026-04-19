import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { getHolidays, isHoliday } from "@haru/shared/korean-calendar";

@Controller("calendar")
export class CalendarController {
  @Get("holidays/:year")
  holidays(@Param("year", ParseIntPipe) year: number) {
    return getHolidays(year).map((h) => ({
      name: h.name,
      date: h.date.toISOString(),
      substitute: h.substitute,
    }));
  }

  @Get("holiday-check/:iso")
  check(@Param("iso") iso: string) {
    const d = new Date(iso);
    const h = isHoliday(d);
    return { isHoliday: !!h, holiday: h ? { name: h.name, substitute: h.substitute } : null };
  }
}
