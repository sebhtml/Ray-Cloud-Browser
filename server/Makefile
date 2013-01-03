# \see http://www.cprogramming.com/tutorial/makefiles_continued.html
# \author Sébastien Boisvert

CXX=g++
CXXFLAGS= -O3 -Wall -march=native -pipe -std=c++98

TARGETS=RayCloudBrowser.commandLineClient RayCloudBrowser.createGraphDatabase RayCloudBrowser.getSubgraphWithPath \
	RayCloudBrowser.webServer

LIBRARY_OBJECTS=GraphDatabase.o VertexObject.o Mapper.o

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $? -o $@

all: $(TARGETS)

RayCloudBrowser.webServer: webServer_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.commandLineClient: commandLineClient_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.createGraphDatabase: createGraphDatabase_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.getSubgraphWithPath: getSubgraphWithPath_main.o $(LIBRARY_OBJECTS)
	$(CXX) $(CXXFLAGS) $^ -o $@

clean:
	rm -f *.o $(TARGETS)

check: test-first test-store test-not-found

test-store:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&content=CATGAAAACGGGTTTTCCCATATTGACGCTA" ./RayCloudBrowser.webServer

test-first:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE" ./RayCloudBrowser.webServer

test-not-found:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&content=fdfddfjdsfdjsclkk" ./RayCloudBrowser.webServer
