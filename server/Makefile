# \see http://www.cprogramming.com/tutorial/makefiles_continued.html
# \author Sébastien Boisvert
# \author Sébastien Boisvert
# \author Sébastien Boisvert
# \author Sébastien Boisvert
# \author Sébastien Boisvert
# \author Sébastien Boisvert

CXX=g++
CXXFLAGS= -O3 -Wall -march=native -pipe

TARGETS=commandLineClient createGraphDatabase getSubgraphWithPath

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $? -o $@

all: $(TARGETS)

commandLineClient: commandLineClient_main.o GraphDatabase.o VertexObject.o
	$(CXX) $(CXXFLAGS) $^ -o $@

createGraphDatabase: createGraphDatabase_main.o
	$(CXX) $(CXXFLAGS) $^ -o $@

getSubgraphWithPath: getSubgraphWithPath_main.o GraphDatabase.o VertexObject.o
	$(CXX) $(CXXFLAGS) $^ -o $@

clean:
	rm -f *.o $(TARGETS)
