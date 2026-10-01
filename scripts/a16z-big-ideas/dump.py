"""Debug helper: print entry bodies. Usage: python3 dump.py <edition> <scratch_dir> <rank> [<rank> ...]"""
import sys
ED, D, ranks = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3:]]
src = open(__file__.replace("dump.py", "parse.py")).read().split("HZ = re.compile")[0]
sys.argv = ["parse.py", ED, D]
exec(src)
ents = parse_2023() if ED == "2023" else parse_2026() if ED == "2026" else parse_2425(ED)
for r in ranks:
    e = ents[r - 1]
    print(r, e["label"]); print("  " + " / ".join(e["body"])[:1400]); print()
