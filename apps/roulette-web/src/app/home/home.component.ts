import {
  buildWheelMoveRows,
  tallyMoveGroupWindows,
  transitionMovesFromRows,
  type Session,
} from '@contracting/roulette-analysis';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinSessionService } from '../services/spin-session.service';
import { FrequencyChartComponent } from './frequency-chart.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, DecimalPipe, JsonPipe, FrequencyChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly sessionSvc = inject(SpinSessionService);
  protected readonly pocketInput = signal<number>(17);
  protected readonly importError = signal<string | null>(null);

  /**
   * Hover `title` text for the wheel-distance panel (native browser tooltips).
   * Kept in the component so copy stays editable without cluttering the template.
   */
  protected readonly wheelMoveTip = {
    sectionHeading:
      'Compares each new winning number to the previous one using the physical European ' +
      'wheel order (not the betting layout). Distances drive the group tables to the right.',
    sectionBlurb:
      'First spin only establishes a starting pocket—there is no “previous” yet. ' +
      'Later spins show how many steps you would take along the shorter rim arc between ' +
      'the last pocket and this one. Repeats are distance 0. Group bins only use moves 1–18.',
    colSpinIndex:
      'Spin index in this session: 1 = first number you recorded, 2 = second, and so on. ' +
      'It lines up with the JSON spin list order (undo removes the latest).',
    colPocket:
      'Pocket: the winning number on a European single-zero wheel (integers 0 through 36). ' +
      'This is the outcome you entered; all wheel math uses the standard physical number ring.',
    colMove:
      'Move: shortest path length along that physical ring from the previous spin’s pocket ' +
      'to this pocket, in steps (pocket to adjacent pocket = 1). Range is 0 (same pocket again) ' +
      'up to 18 on a 37-slot wheel. This value is what the group tallies test against.',
    anchorMove:
      'No move on the first spin: the session needs a prior pocket before a rim distance exists.',
    groupSubhead:
      'Group tallies: separate histograms for several window widths. Each table slices the ' +
      'move scale into overlapping ranges and counts how many spins landed in each range.',
    groupBlurb:
      'For a “group size” of e.g. 7, each row is a window of seven consecutive move sizes ' +
      '(1–7, 2–8, …). When a spin’s move falls inside a window, that row’s Hits increases. ' +
      'One spin can bump several rows because windows overlap. Repeats (move 0) are excluded.',
    colRange:
      'Inclusive range of move sizes for this row. Example: 2–8 means moves 2,3,…,8 all count.',
    colHits:
      'Hits: number of session transitions whose move size fell inside this row’s range. ' +
      'Higher here means that band of distances occurred more often (under this counting rule).',
  } as const;

  protected readonly moveRows = computed(() =>
    buildWheelMoveRows(this.sessionSvc.spins()),
  );

  protected readonly groupTallies = computed(() =>
    tallyMoveGroupWindows(transitionMovesFromRows(this.moveRows())),
  );

  protected moveTooltip(move: number): string {
    if (move === 0) {
      return (
        'Move 0: the same pocket hit twice in a row. Recorded here for the session trail. ' +
        'Group windows only cover moves 1–18, so repeats do not add to the Hits tables.'
      );
    }
    return (
      `Move ${move}: this many steps along the shorter arc of the European wheel rim from ` +
      `the previous pocket to this one. Every group table row whose range includes ${move} ` +
      `gets +1 Hits for this spin.`
    );
  }

  protected groupSizeTooltip(size: number): string {
    return (
      `Group ${size}: sliding windows that are each ${size} integers wide on the move scale ` +
      `(still bounded by 1–18). Wider groups mean fewer rows but each row accepts more ` +
      `possible move values. Compare tables to see how often different band widths “catch” spins.`
    );
  }

  protected groupBinTooltip(
    groupSize: number,
    low: number,
    high: number,
    count: number,
  ): string {
    return (
      `Window [${low}, ${high}] with width ${groupSize} on the move axis. ` +
      `Hits = ${count}: that many transitions had a move between ${low} and ${high} inclusive. ` +
      `Overlapping windows mean the same spin can contribute to multiple rows.`
    );
  }

  protected readonly sessionTip = {
    sessionHeading:
      'Groups all spins you enter under one record: session id is stored in exported JSON.',
    sessionId:
      'Arbitrary label for this run (e.g. table or date). Used when you export/import session JSON; does not change the math.',
    dealerId:
      'Optional tag for who spun the wheel. For your notes only; not used in calculations.',
    manualHeading: 'Add each observed winning pocket in order.',
    pocket:
      'The winning number on a European single-zero wheel: integers 0 (green) through 36. This is appended to the session when you click Add spin.',
    addSpin:
      'Records the current pocket as the next spin in time order. Statistics and bet rankings update from the full list.',
    undoLast: 'Removes the most recently added spin (LIFO).',
    clearSpins:
      'Deletes every spin in this session (cannot be undone except by re-import).',
    exportJson:
      'Downloads the session (id, optional dealer, spins array) as JSON for backup or another tool.',
    importJson:
      'Load a previously saved session file; replaces the current session id, dealer, and spin list.',
    spinsHeading:
      'Raw session data: each entry is one spin with its pocket (and optional timestamp if present in JSON).',
    spinsEmpty: 'No data until you add at least one spin above.',
    spinsJson:
      'Exact structure sent to the analyzer: order matters for sequence-based tests and the wheel-move panel.',
  } as const;

  protected readonly statsTip = {
    sectionHeading:
      'Exploratory tests on your recorded spins. They describe departure from simple random benchmarks; they are not proof of bias or profit.',
    chiTitle:
      'Pearson chi-square test: compares observed counts in all 37 pockets to the counts you would expect if every pocket were equally likely (uniform).',
    chiStatistic:
      'Chi-square statistic: larger means the overall pattern of counts deviates more from “all pockets equally likely.”',
    chiDf:
      'Degrees of freedom: here 36 (37 pockets minus one constraint because probabilities must sum to 1).',
    chiPAsymptotic:
      'Asymptotic p-value: tail probability under the chi-square distribution if the wheel were perfectly fair and sample size is large enough for the approximation.',
    chiPPerm:
      'Permutation / Monte Carlo p-value: shuffles outcomes many times to estimate how extreme your chi-square would be without relying on the asymptotic formula (often more trustworthy when some counts are small).',
    thirdsTitle:
      'Wheel thirds: splits the physical European wheel ring into three contiguous arcs of pockets (not the 1st/2nd/12 layout). Tests whether hits cluster on one third of the rim.',
    thirdsChi:
      'Chi-square for those three rim sectors vs equal one-third probability each.',
    thirdsP:
      'p-value for that rim-sector test; small values mean uneven mass across the three contiguous wheel chunks.',
    runsTitle:
      'Runs test on red vs black (0 is excluded): checks whether streaks of the same color are unusually long or short vs random alternation.',
    runsCount:
      'Number of color runs: a run is a maximal consecutive same-color sequence.',
    runsN: 'n = spins used after dropping green zero from this test.',
    runsP:
      'Two-sided p-value: low values suggest red/black patterning beyond chance under the test’s assumptions.',
    transTitle:
      'Lag-1 transition test: builds a 37×37 table of “previous pocket → next pocket” counts and tests independence (does yesterday’s number predict today’s?).',
    transChi: 'Chi-square statistic for that contingency table.',
    transDf: 'Degrees of freedom for the independence test on that table.',
    transP:
      'p-value for independence; small values mean successive pockets appear associated in your sample (could still be noise).',
    fdrLine:
      'FDR (Benjamini–Hochberg) at α=0.05: among individual pocket tests, these pockets were flagged after adjusting for testing many pockets at once. Not the same as “biased pockets guaranteed.”',
    caveatsList:
      'Bullet list of model and sample caveats from the analyzer (always read alongside p-values).',
    frequencyTitle:
      'Bar chart of how many times each pocket 0–36 appeared in this session.',
  } as const;

  protected readonly betsTip = {
    sectionHeading:
      'This table is where the app surfaces “what to bet” under a toy model: rows are ranked by theoretical expected value (EV) per 1 unit staked using smoothed pocket probabilities—not live odds or house advice.',
    topRowCallout:
      'The first data row is the single bet type the model ranks highest by EV per unit (among all standard bets it evaluates). Lower rows are the next-best alternatives by the same rule. This is not a promise of profit.',
    dirichletNote:
      'Probabilities come from a Dirichlet(1) smoother: adds pseudo-counts so rare pockets are not estimated as exactly zero. Stabilizes EV but pulls estimates toward uniform when data are thin.',
    colBet:
      'Bet type label, e.g. Straight 17 = wager on that one number; Column 2 = one of the three column bets on the layout. Hover a row’s name for payout context.',
    colPWin:
      'P(win), model: the app’s estimated probability this bet wins on the next spin if the smoothed model were exactly true. European rules; ignores real-world friction.',
    colEv:
      'EV / unit: expected profit or loss per 1 unit staked at standard European payouts, using the model probability. Negative = house edge under those assumptions; positive = model thinks the bet is +EV (usually caution: small sample, many bets tested).',
    colNotes:
      'Short warnings from the engine (sample size, uniformity test, “not advice”).',
    betNotesDetail:
      'Automated disclaimer lines bundled with each ranked bet: read with the EV and p-values; many simultaneous comparisons inflate false positives.',
  } as const;

  /** Hover text for each standard roulette label produced by the recommendation engine. */
  protected betSelectionTooltip(label: string): string {
    const straight = /^Straight (\d+)$/.exec(label);
    if (straight) {
      const n = straight[1];
      return (
        `Straight-up on pocket ${n}: wins only if the ball lands on ${n}. ` +
        `Typical European payout 35:1 (net +35 units per unit staked on a win). ` +
        `The model shows its smoothed chance for ${n} and EV at that payout.`
      );
    }
    const colMatch = /^Column (\d)$/.exec(label);
    if (colMatch) {
      const c = colMatch[1];
      const cols: Record<string, string> = {
        '1': '1, 4, 7, …, 34',
        '2': '2, 5, 8, …, 35',
        '3': '3, 6, 9, …, 36',
      };
      return (
        `Column ${c} covers ${cols[c] ?? 'that vertical column'} on the number grid; 0 is not in any column. ` +
        `Pays 2:1. The listed P(win) is the sum of modeled probabilities over those pockets.`
      );
    }
    const dozen = /^Dozen (\d)$/.exec(label);
    if (dozen) {
      const d = dozen[1];
      const bands: Record<string, string> = {
        '1': '1–12',
        '2': '13–24',
        '3': '25–36',
      };
      return (
        `Dozen ${d}: the ${bands[d] ?? ''} block on the layout (0 excluded). Pays 2:1. ` +
        `P(win) aggregates the model’s chance over that block.`
      );
    }
    if (label === 'Red') {
      return (
        'Red: even-money outside bet on all red pockets (European layout). Pays 1:1. ' +
        'Green 0 loses for this bet. P(win) is the sum of modeled red-pocket probabilities.'
      );
    }
    if (label === 'Black') {
      return 'Black: even-money bet on black pockets; 0 loses. P(win) sums modeled black pockets.';
    }
    if (label === 'Odd') {
      return (
        'Odd: even-money on odd numbers 1–35 on the layout; 0 is excluded and loses. ' +
        'P(win) sums modeled probabilities for those odd pockets.'
      );
    }
    if (label === 'Even') {
      return 'Even: even-money on even numbers 2–36; 0 loses. P(win) sums those even pockets under the model.';
    }
    if (label.startsWith('High')) {
      return (
        'High (19–36): even-money on numbers 19 through 36; 0 and 1–18 lose. ' +
        'P(win) is the total modeled probability in the high half.'
      );
    }
    if (label.startsWith('Low')) {
      return (
        'Low (1–18): even-money on numbers 1 through 18; 0 and 19+ lose. ' +
        'P(win) is the total modeled probability in the low half.'
      );
    }
    return (
      `Bet label “${label}”: ranked from a Dirichlet-smoothed model of your session counts. ` +
      `See table header tooltips for P(win) and EV.`
    );
  }

  protected setPocket(v: string | number): void {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isInteger(n) && n >= 0 && n <= 36) {
      this.pocketInput.set(n);
    }
  }

  protected addSpin(): void {
    this.sessionSvc.addSpin(this.pocketInput());
  }

  protected onImportFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const data = JSON.parse(text) as unknown;
        if (
          typeof data === 'object' &&
          data !== null &&
          'id' in data &&
          'spins' in data &&
          Array.isArray((data as { spins: unknown }).spins)
        ) {
          this.sessionSvc.loadSession(data as Session);
          this.importError.set(null);
        } else {
          this.importError.set('Invalid JSON: expected { id, spins[] }');
        }
      } catch {
        this.importError.set('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  }

  protected downloadJson(): void {
    const blob = new Blob([this.sessionSvc.exportJson()], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roulette-session.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
