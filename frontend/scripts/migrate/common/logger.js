export class Logger {
  constructor(label) {
    this.label = label
    this.success = 0
    this.skip = 0
    this.fail = 0
    this.errors = []
  }

  log(message, ...args) {
    console.log(`[${this.label}] ${message}`, ...args)
  }

  recordSuccess() {
    this.success += 1
  }

  recordSkip() {
    this.skip += 1
  }

  recordFail(err) {
    this.fail += 1
    if (err) this.errors.push(err)
  }

  summary() {
    return { success: this.success, skip: this.skip, fail: this.fail }
  }

  printSummary() {
    this.log(`Summary -> success: ${this.success}, skip: ${this.skip}, fail: ${this.fail}`)
  }
}
