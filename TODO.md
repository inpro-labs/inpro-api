1 - Find a way to move auth and session service to application layer (DONE)
2 - Implement ConfigService
3 - Check if all tests are well developed (DONE)
4 - Check if any method is missing (DONE)

PROBLEMS

1 Session can be refreshed infinite times
2 Refactor adapter to mappers

- the idea is that presentation and service has a mappers folder with files like user.mapper.ts
- the mapper must be a class with methods like fromPrismaToDomain, fromDomainToResponse and etc... (or I might think in something funnier)
