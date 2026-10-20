// The command layer uses D1's small prepared-statement interface. Preserve its
// atomic batch semantics when running the same SQL against Turso/libSQL.
export class LibsqlDatabase {
  constructor(client) { this.client = client; }
  prepare(sql) { return this.statement(sql, []); }
  statement(sql, args) {
    const query = {sql, args};
    const convert = result => ({results: result.rows.map(row => ({...row})), meta:{changes:Number(result.rowsAffected)}});
    return {
      query,
      bind: (...values) => this.statement(sql, values),
      first: async () => {const result = await this.client.execute(query); return result.rows[0] ? {...result.rows[0]} : null;},
      all: async () => convert(await this.client.execute(query)),
      run: async () => convert(await this.client.execute(query)),
    };
  }
  async batch(statements) {
    const results = await this.client.batch(statements.map(s => s.query), 'write');
    return results.map(result => ({results:result.rows.map(row => ({...row})),meta:{changes:Number(result.rowsAffected)}}));
  }
}
