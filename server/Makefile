# \see http://www.cprogramming.com/tutorial/makefiles_continued.html
# \author Sébastien Boisvert

CXX=g++
CXXFLAGS= -O3 -Wall -march=native -pipe

TARGETS=RayCloudBrowser.commandLineClient RayCloudBrowser.createGraphDatabase RayCloudBrowser.getSubgraphWithPath

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $? -o $@

all: $(TARGETS)

RayCloudBrowser.commandLineClient: commandLineClient_main.o GraphDatabase.o VertexObject.o
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.createGraphDatabase: createGraphDatabase_main.o
	$(CXX) $(CXXFLAGS) $^ -o $@

RayCloudBrowser.getSubgraphWithPath: getSubgraphWithPath_main.o GraphDatabase.o VertexObject.o
	$(CXX) $(CXXFLAGS) $^ -o $@

clean:
	rm -f *.o $(TARGETS)
