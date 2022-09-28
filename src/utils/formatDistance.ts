export const formatDistance = (num: number): string => {
  if (num < 1e6) {
    return `${formatNum(num)} km away`;
  }

  if (num < 1e9) {
    return `${formatNum(num / 1e6)} million km away`;
  }

  if (num < 1e12) {
    return `${formatNum(num / 1e9)} billion km away`;
  }

  return `${formatNum(num / 9.461e12)} light years away`;
};

const formatNum = (num: number) => {
  return num.toLocaleString('en-us', {
    maximumSignificantDigits: 3,
    maximumFractionDigits: 1,
  });
};
