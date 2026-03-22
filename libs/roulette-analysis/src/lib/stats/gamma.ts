/**
 * Upper regularized incomplete gamma Q(a, x) = Gamma(a,x)/Gamma(a).
 * Used for chi-square survival: P(Chi^2_k > t) = Q(k/2, t/2).
 */
export function upperRegularizedGamma(a: number, x: number): number {
  if (x <= 0) {
    return 1;
  }
  if (a <= 0) {
    throw new Error('Shape a must be positive.');
  }
  if (x < a + 1) {
    return 1 - lowerSeries(a, x);
  }
  return continuedFraction(a, x);
}

function lowerSeries(a: number, x: number): number {
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let n = 1; n <= 200; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * 1e-12) {
      break;
    }
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

function continuedFraction(a: number, x: number): number {
  const ITMAX = 200;
  const EPS = 1e-12;
  const FPMIN = 1e-300;
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= ITMAX; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) {
      d = FPMIN;
    }
    c = b + an / c;
    if (Math.abs(c) < FPMIN) {
      c = FPMIN;
    }
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) {
      break;
    }
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/** Lanczos approximation log(Gamma(z)), z > 0. */
export function logGamma(z: number): number {
  if (z <= 0) {
    throw new Error('logGamma requires positive z.');
  }
  const g = 7;
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = coef[0];
  for (let i = 1; i < g + 2; i++) {
    x += coef[i] / (z + i);
  }
  const t = z + g + 0.5;
  return (
    0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
  );
}

/** Survival function P(Chi^2_df > x). */
export function chiSquareSurvival(x: number, degreesOfFreedom: number): number {
  if (x < 0 || degreesOfFreedom <= 0) {
    throw new Error('Invalid chi-square arguments.');
  }
  return upperRegularizedGamma(degreesOfFreedom / 2, x / 2);
}
