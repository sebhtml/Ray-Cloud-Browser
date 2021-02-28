Ray Cloud Browser: interactively skim processed genomics data with energy

License: GNU General Public License, version 3

## Demos:

- http://covidgenomes.ddns.net (work in progress)
- ~~http://html5-app.qc.to/client~~ (dead link)
- ~~http://ray-cloud-browser.genap.ca/client/~~ (dead link)
- ~~http://genome.ulaval.ca:10090/client/~~ (dead link)

## Motivation

One of the problems with genomics is that you need to deliver large data
to end users before delivering a user experience for visualization.
But most end users are not ready for these large data and in some way it
does not make sense to move large data around.

Ray Cloud Browser is a genome graph browser in the cloud. The purpose is
to visualize genome assemblies and the main claim is that it will help 
researchers understanding a growing array of problems (like assembly algorithms).

The basic design is the same that is found in the Ray assembler -- message passing and
granularity are the two pillars of Ray technologies.
Although currently limited to assembly graph visualization, the Ray technologies
and ideas put forward are reusable freely, through products like RayPlatform, Ray Cloud Browser and
Ray.

For applications of the technology:

Sébastien Boisvert, Frédéric Raymond, Élénie Godzaridis, François Laviolette and Jacques Corbeil.
Ray Meta: scalable de novo metagenome assembly and profiling.
Genome Biology (BioMed Central Ltd).
13:R122, Published: 22 December 2012
http://dx.doi.org/doi:10.1186/gb-2012-13-12-r122

Sébastien Boisvert, François Laviolette, and Jacques Corbeil.
Ray: simultaneous assembly of reads from a mix of high-throughput sequencing technologies.
Journal of Computational Biology (Mary Ann Liebert, Inc. publishers).
November 2010, 17(11): 1519-1533.
http://dx.doi.org/doi:10.1089/cmb.2009.0238


## Supported tools for generating the graph files

These products can output a file in the Ray Cloud Browser format:

- Ray assembler http://denovoassembler.sourceforge.net/ (option -write-kmers)
- ABySS http://www.bcgsc.ca/platform/bioinfo/software/abyss/ (option --ray)
  see https://github.com/bcgsc/abyss/commit/1e3d2f3bd060fbbff2ae77486f189aad1677b864

## Deployment

For deployment, a web server is needed and clients must have a modern
web browser supporting HTML5.

See the docker/ directory for a complete deployment solution.

## Official website

	https://github.com/sebhtml/Ray-Cloud-Browser

## Legal notice:

All the code is licensed under the GNU General Public License, version 3, see LICENSE.

The client in Ray-Cloud-Browser is a fork of the force-graph project (license: GPLv3).
  => https://github.com/sebhtml/force-graph

Ray Cloud Browser does not bundle any external library.


## Architecture

It is a client-server application. The client runs in a browser with Javascript and HTML5.
The server is in C++ and runs with Apache or any web server with CGI support.

The server is in C++ 1998.
The messaging is done with HTTP (rfc 2616).
The client is in HTML5 and Javascript.

see client/README and server/README for more detail.

