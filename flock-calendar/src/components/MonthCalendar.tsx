import { dateParts, formatMonth, isoDate, todayIso } from '@/lib/date';
import { CaretLeftIcon, CaretRightIcon } from 'phosphor-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  /** Any ISO date inside the month to render. */
  monthAnchor: string;
  dueCount: (date: string) => number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MonthCalendar({
  monthAnchor,
  dueCount,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: Props) {
  const { year, month } = dateParts(monthAnchor);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (string | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(isoDate(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const today = todayIso();

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          accessibilityLabel="Previous month"
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
          onPress={onPrevMonth}
        >
          <Text className="text-foreground text-base"><CaretLeftIcon size={16}/></Text>
        </TouchableOpacity>

        <Text className="text-foreground font-bold text-base">
          {formatMonth(monthAnchor)}
        </Text>

        <TouchableOpacity
          accessibilityLabel="Next month"
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
          onPress={onNextMonth}
        >
          <Text className="text-foreground text-base">< CaretRightIcon size={16} /></Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={`${label}-${i}`} className="flex-1 items-center py-1">
            <Text className="text-[10px] font-semibold text-muted-foreground">
              {label}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row">
          {week.map((date, dayIndex) => {
            if (!date) {
              return <View key={dayIndex} className="flex-1 py-1" />;
            }
            const { day } = dateParts(date);
            const isToday = date === today;
            const count = dueCount(date);

            return (
              <TouchableOpacity
                key={date}
                className="flex-1 items-center py-1"
                activeOpacity={0.6}
                onPress={() => onSelectDate(date)}
              >
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    isToday ? 'bg-primary' : ''
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isToday
                        ? 'text-primary-foreground font-bold'
                        : 'text-foreground'
                    }`}
                  >
                    {day}
                  </Text>
                </View>
                <View className="h-1.5 flex-row items-center gap-0.5 mt-0.5">
                  {count > 0 &&
                    Array.from({ length: Math.min(count, 3) }).map((_, dot) => (
                      <View
                        key={dot}
                        className={`w-1 h-1 rounded-full ${
                          isToday ? 'bg-secondary' : 'bg-primary'
                        }`}
                      />
                    ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
