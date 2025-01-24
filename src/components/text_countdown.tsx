import { useEffect, useState } from "react";
import { COUNTDOWN_DEFAULT_FORMATS } from "../common/enums";

function evaluateFormat(
  format: string | ((value: number) => string),
  value: string | number
) {
  if (typeof format === "function") {
    return format(Number(value));
  }
  return format.replace("%@", value.toString());
}

function isCloseToNow(d: number): boolean {
  return d <= 0 && d > -60000;
}

interface CountdownFormats {
  immediate: string;
  forFuture: string;
  forPast: string;
  days: string | ((value: number) => string);
  hours: string | ((value: number) => string);
  minutes: string | ((value: number) => string);
  seconds: string | ((value: number) => string);
  separator: string;
}

interface TextCountdownProps {
  to: number;
  formatStrings?: Partial<CountdownFormats>;
}

export default function TextCountdown(props: TextCountdownProps) {
  const [delta, setDelta] = useState(props.to - Date.now());
  const formats = { ...COUNTDOWN_DEFAULT_FORMATS, ...props.formatStrings };

  useEffect(() => {
    const timer = setInterval(() => {
      setDelta(props.to - Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [props.to]);

  const formattedTime = (
    components: string[],
    isDateInPast: boolean
  ): string => {
    const cs = components.join(formats.separator);
    return isDateInPast
      ? evaluateFormat(formats.forPast, cs)
      : evaluateFormat(formats.forFuture, cs);
  };

  const isNow = isCloseToNow(delta);
  const isNegative = delta < 0;
  const effectiveDelta = Math.abs(delta);

  if (isNow) {
    return <>{formats.immediate}</>;
  }

  const days = (effectiveDelta / 86400000) | 0;
  const hours = ((effectiveDelta % 86400000) / 3600000) | 0;
  const minutes = ((effectiveDelta % 3600000) / 60000) | 0;
  const seconds = Math.round((effectiveDelta % 60000) / 1000);

  const components: string[] = [];
  if (days) components.push(evaluateFormat(formats.days, days));
  if (hours) components.push(evaluateFormat(formats.hours, hours));
  if (minutes) components.push(evaluateFormat(formats.minutes, minutes));
  if (seconds) components.push(evaluateFormat(formats.seconds, seconds));

  return <>{formattedTime(components, isNegative)}</>;
}
