#!/usr/bin/env python3

# From https://www.biostars.org/p/710/

from Bio import SeqIO
import sys

def main(argv):
    if len(argv) != 3:
        raise Exception("Invalid arguments")
    input_file = argv[1]
    output_file = argv[2]
    fasta_sequences = SeqIO.parse(open(input_file),'fasta')
    with open(output_file, "w") as out_file:
        writer = SeqIO.FastaIO.FastaWriter(out_file, 0)
        for record in fasta_sequences:
            writer.write_record(record)

if __name__ == "__main__":
    main(sys.argv)

