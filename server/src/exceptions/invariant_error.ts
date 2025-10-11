export class InvariantError extends Error {
  constructor(public override message: string) {
    super(message)
  }
}